import { getNotesKey } from './auth'
import {
  notesLogger as log,
  logError,
  logStorageRequest,
  logStorageResponse,
  logEvent,
} from './logger'

const LEGACY_NOTES_KEY = 'notes-app-data'

function readRawNotes(userId) {
  const key = getNotesKey(userId)
  logStorageRequest('GET', key, { userId })
  try {
    const saved = localStorage.getItem(key)
    const notes = saved ? JSON.parse(saved) : []
    logStorageResponse('GET', key, true, { userId, noteCount: notes.length })
    return notes
  } catch (err) {
    logStorageResponse('GET', key, false, { userId, err: err.message })
    logError(err, { operation: 'readNotes', userId, key }, 'Failed to read notes')
    return []
  }
}

function writeRawNotes(userId, notes) {
  const key = getNotesKey(userId)
  logStorageRequest('SET', key, { userId, noteCount: notes.length })
  try {
    localStorage.setItem(key, JSON.stringify(notes))
    logStorageResponse('SET', key, true, { userId, noteCount: notes.length })
    log.debug({ userId, noteCount: notes.length }, 'Notes written to storage')
  } catch (err) {
    logStorageResponse('SET', key, false, { userId, err: err.message })
    logError(err, { operation: 'writeNotes', userId, key }, 'Failed to write notes')
    throw err
  }
}

function belongsToUser(note, userId) {
  return !note.userId || note.userId === userId
}

function attachUserId(note, userId) {
  return { ...note, userId }
}

function migrateLegacyNotes(userId) {
  try {
    const legacy = localStorage.getItem(LEGACY_NOTES_KEY)
    if (!legacy) return

    const legacyNotes = JSON.parse(legacy)
    if (!Array.isArray(legacyNotes) || legacyNotes.length === 0) {
      localStorage.removeItem(LEGACY_NOTES_KEY)
      return
    }

    const existing = readRawNotes(userId)
    const migrated = legacyNotes.map((note) => attachUserId(note, userId))
    writeRawNotes(userId, [...migrated, ...existing])
    localStorage.removeItem(LEGACY_NOTES_KEY)
    logEvent('notes.legacy.migrated', { userId, migratedCount: legacyNotes.length })
    log.info({ userId, migratedCount: legacyNotes.length }, 'Legacy notes migrated')
  } catch (err) {
    logError(err, { operation: 'migrateLegacyNotes', userId }, 'Legacy notes migration failed')
  }
}

export function loadNotesForUser(userId) {
  log.debug({ userId }, 'Loading notes for user')
  migrateLegacyNotes(userId)

  const notes = readRawNotes(userId)
    .filter((note) => belongsToUser(note, userId))
    .map((note) => attachUserId(note, userId))

  log.info({ userId, noteCount: notes.length }, 'Notes loaded for user')
  return notes
}

export function saveNotesForUser(userId, notes) {
  const ownedNotes = notes
    .filter((note) => belongsToUser(note, userId))
    .map((note) => attachUserId(note, userId))

  writeRawNotes(userId, ownedNotes)
  return ownedNotes
}

export function createNoteForUser(userId, { title, content }) {
  const notes = loadNotesForUser(userId)
  const newNote = {
    id: crypto.randomUUID(),
    userId,
    title: title.trim(),
    content: content.trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const updated = [newNote, ...notes]
  saveNotesForUser(userId, updated)
  log.info({ userId, noteId: newNote.id, title: newNote.title }, 'Note created')
  return updated
}

export function updateNoteForUser(userId, noteId, { title, content }) {
  const notes = loadNotesForUser(userId)
  const note = notes.find((n) => n.id === noteId)

  if (!note || note.userId !== userId) {
    log.warn({ userId, noteId }, 'Note update denied: not found or unauthorized')
    return notes
  }

  const updated = notes.map((n) =>
    n.id === noteId
      ? {
          ...n,
          userId,
          title: title.trim(),
          content: content.trim(),
          updatedAt: Date.now(),
        }
      : n
  )

  saveNotesForUser(userId, updated)
  log.info({ userId, noteId, title: title.trim() }, 'Note updated')
  return updated
}

export function deleteNoteForUser(userId, noteId) {
  const notes = loadNotesForUser(userId)
  const note = notes.find((n) => n.id === noteId)

  if (!note || note.userId !== userId) {
    log.warn({ userId, noteId }, 'Note delete denied: not found or unauthorized')
    return notes
  }

  const updated = notes.filter((n) => n.id !== noteId)
  saveNotesForUser(userId, updated)
  log.info({ userId, noteId }, 'Note deleted')
  return updated
}
