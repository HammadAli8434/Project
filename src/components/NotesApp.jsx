import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  loadNotesForUser,
  createNoteForUser,
  updateNoteForUser,
  deleteNoteForUser,
} from '../utils/notesStorage'
import { notesLogger as log, logUserActivity } from '../utils/logger'
import { useError } from '../context/ErrorContext'
import NoteForm from './NoteForm'
import NoteList from './NoteList'
import './NotesApp.css'

function NotesApp() {
  const { user, logOut } = useAuth()
  const { showError } = useError()
  const [notes, setNotes] = useState(() => loadNotesForUser(user.id))
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    log.info({ userId: user.id }, 'Notes dashboard mounted for user')
    logUserActivity('notes.dashboard.open', { userId: user.id }, user.id)
    setNotes(loadNotesForUser(user.id))
    setEditingId(null)
  }, [user.id])

  function createNote(title, content) {
    try {
      logUserActivity('notes.create', { userId: user.id, title: title.trim() }, user.id)
      setNotes(createNoteForUser(user.id, { title, content }))
    } catch (err) {
      showError(err, { action: 'notes.create', userId: user.id })
    }
  }

  function updateNote(id, title, content) {
    try {
      logUserActivity('notes.update', { userId: user.id, noteId: id, title: title.trim() }, user.id)
      setNotes(updateNoteForUser(user.id, id, { title, content }))
      setEditingId(null)
    } catch (err) {
      showError(err, { action: 'notes.update', userId: user.id, noteId: id })
    }
  }

  function deleteNote(id) {
    try {
      logUserActivity('notes.delete', { userId: user.id, noteId: id }, user.id)
      setNotes(deleteNoteForUser(user.id, id))
      if (editingId === id) setEditingId(null)
    } catch (err) {
      showError(err, { action: 'notes.delete', userId: user.id, noteId: id })
    }
  }

  function startEdit(id) {
    logUserActivity('notes.edit.start', { userId: user.id, noteId: id }, user.id)
    setEditingId(id)
  }

  function cancelEdit() {
    logUserActivity('notes.edit.cancel', { userId: user.id, noteId: editingId }, user.id)
    setEditingId(null)
  }

  const editingNote = notes.find((note) => note.id === editingId && note.userId === user.id) ?? null

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <div className="app-header-icon" aria-hidden="true">
            <span className="icon icon-note" />
          </div>
          <div className="app-user-bar">
            <span className="app-user-greeting">
              Hello, <strong>{user.name}</strong>
            </span>
            <button type="button" className="btn btn-logout" onClick={logOut}>
              <span className="icon icon-close" aria-hidden="true" />
              Log Out
            </button>
          </div>
        </div>
        <h1>My Notes</h1>
        <p className="app-subtitle">
          Your private notes — only visible to you
        </p>
      </header>

      <main className="app-main">
        <NoteForm
          key={editingId ?? 'new'}
          editingNote={editingNote}
          onSave={(title, content) => {
            if (editingNote) {
              updateNote(editingNote.id, title, content)
            } else {
              createNote(title, content)
            }
          }}
          onCancel={editingNote ? cancelEdit : undefined}
        />

        <NoteList
          notes={notes}
          editingId={editingId}
          onEdit={startEdit}
          onDelete={deleteNote}
        />
      </main>
    </div>
  )
}

export default NotesApp
