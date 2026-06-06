import { useState } from 'react'
import RichTextEditor from './RichTextEditor'
import { isContentEmpty } from '../utils/noteContent'
import { logUserActivity } from '../utils/logger'
import './NoteForm.css'

function NoteForm({ editingNote, onSave, onCancel }) {
  const [title, setTitle] = useState(editingNote?.title ?? '')
  const [content, setContent] = useState(editingNote?.content ?? '')

  const canSave = title.trim() || !isContentEmpty(content)
  const isEditing = Boolean(editingNote)

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSave) {
      logUserActivity('notes.form.validation_failure', {
        action: isEditing ? 'update' : 'create',
        reason: 'empty_note',
      })
      return
    }
    logUserActivity(isEditing ? 'notes.form.submit.update' : 'notes.form.submit.create', {
      title: title.trim(),
    })
    onSave(title, content)
    if (!editingNote) {
      setTitle('')
      setContent('')
    }
  }

  return (
    <form
      className={`note-form ${isEditing ? 'note-form--editing' : ''}`}
      onSubmit={handleSubmit}
    >
      <div className="note-form-header">
        <div className="note-form-icon" aria-hidden="true">
          <span className={`icon ${isEditing ? 'icon-edit' : 'icon-plus'}`} />
        </div>
        <h2 className="note-form-title">
          {isEditing ? 'Edit Note' : 'New Note'}
        </h2>
      </div>

      <div className="note-form-field">
        <label className="note-form-label" htmlFor="note-title">
          Title
        </label>
        <input
          id="note-title"
          type="text"
          className="note-form-input"
          placeholder="Give your note a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="note-form-field">
        <label className="note-form-label">Content</label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your note here..."
        />
      </div>

      <div className="note-form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            <span className="icon icon-close" aria-hidden="true" />
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={!canSave}>
          <span className={`icon ${isEditing ? 'icon-save' : 'icon-plus'}`} aria-hidden="true" />
          {isEditing ? 'Save Changes' : 'Add Note'}
        </button>
      </div>
    </form>
  )
}

export default NoteForm
