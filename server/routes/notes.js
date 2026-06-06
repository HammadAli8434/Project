import { Router } from 'express'
import { randomUUID } from 'crypto'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/AppError.js'
import {
  getNotesByUserId,
  findNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../store/memoryStore.js'
import { requireAuth } from '../middleware/auth.js'
import { notesLogger as log } from '../utils/logger.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    log.debug(
      {
        event: 'notes.list.attempt',
        requestId: req.id,
        userId: req.user.id,
      },
      'Fetching all notes for user'
    )

    const notes = getNotesByUserId(req.user.id)

    log.info(
      {
        event: 'notes.list.success',
        requestId: req.id,
        userId: req.user.id,
        count: notes.length,
      },
      `Retrieved ${notes.length} notes`
    )

    res.json({ success: true, data: { notes } })
  })
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const noteId = req.params.id
    log.debug(
      {
        event: 'notes.get.attempt',
        requestId: req.id,
        userId: req.user.id,
        noteId,
      },
      'Fetching note by ID'
    )

    const note = findNoteById(noteId)

    if (!note) {
      log.warn(
        {
          event: 'notes.get.not_found',
          requestId: req.id,
          userId: req.user.id,
          noteId,
        },
        'Note not found'
      )
      throw new NotFoundError('Note not found.')
    }

    if (note.userId !== req.user.id) {
      log.warn(
        {
          event: 'notes.get.forbidden',
          requestId: req.id,
          userId: req.user.id,
          noteId,
          ownerId: note.userId,
        },
        'User attempted to access another user\'s note'
      )
      throw new ForbiddenError('You can only view your own notes.')
    }

    log.info(
      {
        event: 'notes.get.success',
        requestId: req.id,
        userId: req.user.id,
        noteId,
      },
      'Note retrieved successfully'
    )

    res.json({ success: true, data: { note } })
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { title = '', content = '' } = req.body ?? {}

    log.debug(
      {
        event: 'notes.create.attempt',
        requestId: req.id,
        userId: req.user.id,
        titleLength: title.length,
        contentLength: content.length,
      },
      'Creating new note'
    )

    if (!title.trim() && !content.trim()) {
      log.warn(
        {
          event: 'notes.create.validation_failed',
          requestId: req.id,
          userId: req.user.id,
          reason: 'empty_content',
        },
        'Note creation failed: title and content are empty'
      )
      throw new ValidationError('A note must have a title or content.')
    }

    const note = createNote({
      id: randomUUID(),
      userId: req.user.id,
      title: title.trim(),
      content: content.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    log.info(
      {
        event: 'notes.create.success',
        requestId: req.id,
        userId: req.user.id,
        noteId: note.id,
        titleLength: note.title.length,
        contentLength: note.content.length,
      },
      'Note created successfully'
    )

    res.status(201).json({ success: true, data: { note } })
  })
)

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const noteId = req.params.id
    log.debug(
      {
        event: 'notes.update.attempt',
        requestId: req.id,
        userId: req.user.id,
        noteId,
      },
      'Updating note'
    )

    const note = findNoteById(noteId)

    if (!note) {
      log.warn(
        {
          event: 'notes.update.not_found',
          requestId: req.id,
          userId: req.user.id,
          noteId,
        },
        'Note not found'
      )
      throw new NotFoundError('Note not found.')
    }

    if (note.userId !== req.user.id) {
      log.warn(
        {
          event: 'notes.update.forbidden',
          requestId: req.id,
          userId: req.user.id,
          noteId,
          ownerId: note.userId,
        },
        'User attempted to update another user\'s note'
      )
      throw new ForbiddenError('You can only edit your own notes.')
    }

    const { title = note.title, content = note.content } = req.body ?? {}

    if (!title.trim() && !content.trim()) {
      log.warn(
        {
          event: 'notes.update.validation_failed',
          requestId: req.id,
          userId: req.user.id,
          noteId,
          reason: 'empty_content',
        },
        'Note update failed: title and content are empty'
      )
      throw new ValidationError('A note must have a title or content.')
    }

    const updated = updateNote({
      ...note,
      title: title.trim(),
      content: content.trim(),
      updatedAt: Date.now(),
    })

    log.info(
      {
        event: 'notes.update.success',
        requestId: req.id,
        userId: req.user.id,
        noteId: updated.id,
        titleLength: updated.title.length,
        contentLength: updated.content.length,
      },
      'Note updated successfully'
    )

    res.json({ success: true, data: { note: updated } })
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const noteId = req.params.id
    log.debug(
      {
        event: 'notes.delete.attempt',
        requestId: req.id,
        userId: req.user.id,
        noteId,
      },
      'Deleting note'
    )

    const note = findNoteById(noteId)

    if (!note) {
      log.warn(
        {
          event: 'notes.delete.not_found',
          requestId: req.id,
          userId: req.user.id,
          noteId,
        },
        'Note not found'
      )
      throw new NotFoundError('Note not found.')
    }

    if (note.userId !== req.user.id) {
      log.warn(
        {
          event: 'notes.delete.forbidden',
          requestId: req.id,
          userId: req.user.id,
          noteId,
          ownerId: note.userId,
        },
        'User attempted to delete another user\'s note'
      )
      throw new ForbiddenError('You can only delete your own notes.')
    }

    deleteNote(noteId)
    log.info(
      {
        event: 'notes.delete.success',
        requestId: req.id,
        userId: req.user.id,
        noteId,
      },
      'Note deleted successfully'
    )

    res.json({ success: true, data: { id: noteId } })
  })
)

export default router
