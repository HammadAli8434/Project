const users = new Map()
const notes = new Map()

export function findUserByEmail(email) {
  return [...users.values()].find((u) => u.email === email.toLowerCase()) ?? null
}

export function findUserById(id) {
  return users.get(id) ?? null
}

export function createUser(user) {
  users.set(user.id, user)
  return user
}

export function getNotesByUserId(userId) {
  return [...notes.values()]
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function findNoteById(noteId) {
  return notes.get(noteId) ?? null
}

export function createNote(note) {
  notes.set(note.id, note)
  return note
}

export function updateNote(note) {
  notes.set(note.id, note)
  return note
}

export function deleteNote(noteId) {
  return notes.delete(noteId)
}
