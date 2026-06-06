import { isContentEmpty, isHtmlContent } from '../utils/noteContent'
import './NoteCard.css'

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function NoteCard({ note, accentIndex, isEditing, onEdit, onDelete }) {
  const hasContent = !isContentEmpty(note.content)

  return (
    <article
      className={`note-card note-card--accent-${accentIndex} ${isEditing ? 'note-card--editing' : ''}`}
    >
      <div className="note-card-header">
        <h3 className="note-card-title">
          {note.title || <span className="note-card-untitled">Untitled</span>}
        </h3>
        <div className="note-card-actions">
          <button
            type="button"
            className="btn-icon btn-edit"
            onClick={onEdit}
            disabled={isEditing}
            aria-label="Edit note"
            title="Edit"
          >
            <span className="icon icon-edit" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-icon btn-delete"
            onClick={onDelete}
            aria-label="Delete note"
            title="Delete"
          >
            <span className="icon icon-trash" aria-hidden="true" />
          </button>
        </div>
      </div>

      {hasContent && (
        <div className="note-card-body">
          {isHtmlContent(note.content) ? (
            <div
              className="note-card-content rich-text"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          ) : (
            <p className="note-card-content">{note.content}</p>
          )}
        </div>
      )}

      <footer className="note-card-footer">
        <time className="note-card-date" dateTime={new Date(note.updatedAt).toISOString()}>
          <span className="icon icon-calendar" aria-hidden="true" />
          {formatDate(note.updatedAt)}
        </time>
      </footer>
    </article>
  )
}

export default NoteCard
