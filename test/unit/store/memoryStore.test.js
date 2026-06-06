import { expect } from 'chai'
import { randomUUID } from 'crypto'
import {
  findUserByEmail,
  findUserById,
  createUser,
  getNotesByUserId,
  findNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../../../server/store/memoryStore.js'

describe('Memory Store', () => {
  // Helper to create test user
  const createTestUser = () => ({
    id: randomUUID(),
    name: 'Test User',
    email: `test-${randomUUID()}@example.com`,
    passwordHash: 'hashedpassword',
    createdAt: Date.now(),
  })

  // Helper to create test note
  const createTestNote = (userId) => ({
    id: randomUUID(),
    userId,
    title: 'Test Note',
    content: 'Test Content',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  describe('User Operations', () => {
    it('should create a user', () => {
      const user = createTestUser()
      const created = createUser(user)
      expect(created).to.deep.equal(user)
      expect(created.id).to.equal(user.id)
    })

    it('should find user by email', () => {
      const user = createTestUser()
      createUser(user)
      const found = findUserByEmail(user.email)
      expect(found).to.deep.equal(user)
    })

    it('should find user by email case-insensitively', () => {
      const user = createTestUser()
      createUser(user)
      const found = findUserByEmail(user.email.toUpperCase())
      expect(found).to.deep.equal(user)
    })

    it('should return null when user not found by email', () => {
      const found = findUserByEmail('nonexistent@example.com')
      expect(found).to.be.null
    })

    it('should find user by id', () => {
      const user = createTestUser()
      createUser(user)
      const found = findUserById(user.id)
      expect(found).to.deep.equal(user)
    })

    it('should return null when user not found by id', () => {
      const found = findUserById(randomUUID())
      expect(found).to.be.null
    })

    it('should handle multiple users', () => {
      const user1 = createTestUser()
      const user2 = createTestUser()
      createUser(user1)
      createUser(user2)
      expect(findUserById(user1.id)).to.deep.equal(user1)
      expect(findUserById(user2.id)).to.deep.equal(user2)
    })
  })

  describe('Note Operations', () => {
    let testUserId

    beforeEach(() => {
      testUserId = randomUUID()
    })

    it('should create a note', () => {
      const note = createTestNote(testUserId)
      const created = createNote(note)
      expect(created).to.deep.equal(note)
    })

    it('should find note by id', () => {
      const note = createTestNote(testUserId)
      createNote(note)
      const found = findNoteById(note.id)
      expect(found).to.deep.equal(note)
    })

    it('should return null when note not found', () => {
      const found = findNoteById(randomUUID())
      expect(found).to.be.null
    })

    it('should update a note', () => {
      const note = createTestNote(testUserId)
      createNote(note)

      const updated = updateNote({
        ...note,
        title: 'Updated Title',
        content: 'Updated Content',
        updatedAt: Date.now(),
      })

      expect(updated.title).to.equal('Updated Title')
      expect(updated.content).to.equal('Updated Content')
      expect(findNoteById(note.id).title).to.equal('Updated Title')
    })

    it('should delete a note', () => {
      const note = createTestNote(testUserId)
      createNote(note)
      expect(findNoteById(note.id)).to.not.be.null

      const deleted = deleteNote(note.id)
      expect(deleted).to.be.true
      expect(findNoteById(note.id)).to.be.null
    })

    it('should return false when deleting non-existent note', () => {
      const deleted = deleteNote(randomUUID())
      expect(deleted).to.be.false
    })

    it('should get notes by user id sorted by updatedAt descending', () => {
      const now = Date.now()
      const note1 = { ...createTestNote(testUserId), createdAt: now, updatedAt: now }
      const note2 = { ...createTestNote(testUserId), createdAt: now + 1, updatedAt: now + 1 }
      const note3 = { ...createTestNote(testUserId), createdAt: now + 2, updatedAt: now + 2 }

      createNote(note1)
      createNote(note2)
      createNote(note3)

      const notes = getNotesByUserId(testUserId)
      expect(notes).to.have.lengthOf(3)
      expect(notes[0].updatedAt).to.equal(now + 2)
      expect(notes[1].updatedAt).to.equal(now + 1)
      expect(notes[2].updatedAt).to.equal(now)
    })

    it('should only return notes for specific user', () => {
      const user1Id = randomUUID()
      const user2Id = randomUUID()

      const note1 = createTestNote(user1Id)
      const note2 = createTestNote(user2Id)

      createNote(note1)
      createNote(note2)

      const user1Notes = getNotesByUserId(user1Id)
      const user2Notes = getNotesByUserId(user2Id)

      expect(user1Notes).to.have.lengthOf(1)
      expect(user1Notes[0].userId).to.equal(user1Id)

      expect(user2Notes).to.have.lengthOf(1)
      expect(user2Notes[0].userId).to.equal(user2Id)
    })

    it('should return empty array for user with no notes', () => {
      const notes = getNotesByUserId(randomUUID())
      expect(notes).to.be.an('array').that.is.empty
    })

    it('should handle multiple notes per user', () => {
      const note1 = createTestNote(testUserId)
      const note2 = createTestNote(testUserId)
      const note3 = createTestNote(testUserId)

      createNote(note1)
      createNote(note2)
      createNote(note3)

      const notes = getNotesByUserId(testUserId)
      expect(notes).to.have.lengthOf(3)
      expect(notes.every((n) => n.userId === testUserId)).to.be.true
    })
  })
})
