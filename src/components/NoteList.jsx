import NoteCard from './NoteCard'
import './NoteList.css'

function NoteList({ notes, editingId, onEdit, onDelete }) {
  if (notes.length === 0) {
    return (
      <div className="note-list-empty">
        <div className="note-list-empty-icon" aria-hidden="true">
          <span className="icon icon-empty" />
        </div>
        <p>No notes yet. Create your first one above!</p>
      </div>
    )
  }

  return (
    <section className="note-list">
      <h2 className="note-list-heading">
        <span className="note-list-heading-icon" aria-hidden="true">
          <span className="icon icon-note" />
        </span>
        Your Notes
        <span className="note-count">{notes.length}</span>
      </h2>
      <div className="note-grid">
        {notes.map((note, index) => (
          <NoteCard
            key={note.id}
            note={note}
            accentIndex={index % 6}
            isEditing={note.id === editingId}
            onEdit={() => onEdit(note.id)}
            onDelete={() => onDelete(note.id)}
          />
        ))}
      </div>
    </section>
  )
}

export default NoteList
