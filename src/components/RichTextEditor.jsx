import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import './RichTextEditor.css'

function ToolbarButton({ active, onClick, title, iconClass }) {
  return (
    <button
      type="button"
      className={`rte-btn ${active ? 'rte-btn--active' : ''}`}
      onClick={onClick}
      title={title}
      aria-pressed={active}
      aria-label={title}
    >
      <span className={`icon ${iconClass}`} aria-hidden="true" />
    </button>
  )
}

function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class: 'rte-content',
        'data-placeholder': placeholder,
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const next = value || ''
    if (current !== next) {
      editor.commands.setContent(next, false)
    }
  }, [editor, value])

  if (!editor) return null

  return (
    <div className="rich-text-editor">
      <div className="rte-toolbar" role="toolbar" aria-label="Text formatting">
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          iconClass="icon-bold"
        />
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          iconClass="icon-italic"
        />
        <ToolbarButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
          iconClass="icon-strike"
        />

        <span className="rte-divider" aria-hidden="true" />

        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading"
          iconClass="icon-heading"
        />
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
          iconClass="icon-list-bullet"
        />
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
          iconClass="icon-list-number"
        />
        <ToolbarButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
          iconClass="icon-quote"
        />

        <span className="rte-divider" aria-hidden="true" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
          iconClass="icon-undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
          iconClass="icon-redo"
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor
