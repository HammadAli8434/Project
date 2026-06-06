-- =============================================================================
-- Sample seed data (PostgreSQL)
-- Password hash is a placeholder — replace with bcrypt/argon2 in production.
-- =============================================================================

INSERT INTO users (id, name, email, password_hash) VALUES
    ('a1000000-0000-4000-8000-000000000001', 'Alice Johnson', 'alice@example.com', 'REPLACE_WITH_BCRYPT_HASH'),
    ('a1000000-0000-4000-8000-000000000002', 'Bob Smith', 'bob@example.com', 'REPLACE_WITH_BCRYPT_HASH');

INSERT INTO notes (id, user_id, title, content) VALUES
    (
        'b2000000-0000-4000-8000-000000000001',
        'a1000000-0000-4000-8000-000000000001',
        'Welcome Note',
        '<p>Hello <strong>Alice</strong>! This is your first note.</p>'
    ),
    (
        'b2000000-0000-4000-8000-000000000002',
        'a1000000-0000-4000-8000-000000000001',
        'Shopping List',
        '<ul><li>Milk</li><li>Bread</li><li>Eggs</li></ul>'
    ),
    (
        'b2000000-0000-4000-8000-000000000003',
        'a1000000-0000-4000-8000-000000000002',
        'Meeting Notes',
        '<h2>Team Sync</h2><p>Discuss project timeline and deliverables.</p>'
    );

INSERT INTO activity_logs (user_id, event_type, action, metadata) VALUES
    ('a1000000-0000-4000-8000-000000000001', 'user.activity', 'auth.login.success', '{"email": "alice@example.com"}'),
    ('a1000000-0000-4000-8000-000000000001', 'user.activity', 'notes.create', '{"noteId": "b2000000-0000-4000-8000-000000000001"}');
