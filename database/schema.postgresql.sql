-- =============================================================================
-- Notes App — PostgreSQL Schema
-- =============================================================================
-- Run:  psql -U postgres -d notes_app -f schema.postgresql.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- USERS
-- Stores authenticated account information.
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_lowercase CHECK (email = LOWER(email)),
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE UNIQUE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_created_at ON users (created_at DESC);

COMMENT ON TABLE users IS 'Application users with authentication credentials';
COMMENT ON COLUMN users.password_hash IS 'Hashed password (e.g. bcrypt/argon2); never store plain text';

-- -----------------------------------------------------------------------------
-- NOTES
-- Rich-text notes owned by a single user.
-- -----------------------------------------------------------------------------
CREATE TABLE notes (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    title           VARCHAR(255)    NOT NULL DEFAULT '',
    content         TEXT            NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notes_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_notes_user_id ON notes (user_id);
CREATE INDEX idx_notes_user_updated ON notes (user_id, updated_at DESC);
CREATE INDEX idx_notes_created_at ON notes (created_at DESC);

COMMENT ON TABLE notes IS 'User-owned notes; content stores rich-text HTML from the editor';
COMMENT ON COLUMN notes.user_id IS 'Owner of the note; enforces per-user data isolation';

-- -----------------------------------------------------------------------------
-- USER SESSIONS
-- Server-side sessions / refresh tokens for authenticated API access.
-- -----------------------------------------------------------------------------
CREATE TABLE user_sessions (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    token_hash      VARCHAR(255)    NOT NULL,
    expires_at      TIMESTAMPTZ     NOT NULL,
    ip_address      INET,
    user_agent      VARCHAR(512),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    revoked_at      TIMESTAMPTZ,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX idx_sessions_token_hash ON user_sessions (token_hash);
CREATE INDEX idx_sessions_user_id ON user_sessions (user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions (expires_at);

COMMENT ON TABLE user_sessions IS 'Active login sessions; store hashed tokens only';

-- -----------------------------------------------------------------------------
-- ACTIVITY LOGS
-- Persistent audit trail for user actions and application events.
-- -----------------------------------------------------------------------------
CREATE TABLE activity_logs (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         UUID,
    event_type      VARCHAR(100)    NOT NULL,
    action          VARCHAR(100)    NOT NULL,
    metadata        JSONB           NOT NULL DEFAULT '{}',
    ip_address      INET,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_activity_user_id ON activity_logs (user_id);
CREATE INDEX idx_activity_event_type ON activity_logs (event_type);
CREATE INDEX idx_activity_created_at ON activity_logs (created_at DESC);
CREATE INDEX idx_activity_metadata ON activity_logs USING GIN (metadata);

COMMENT ON TABLE activity_logs IS 'User activity and important application events for auditing';

-- -----------------------------------------------------------------------------
-- NOTE REVISIONS (optional history)
-- Keeps previous versions when a note is edited.
-- -----------------------------------------------------------------------------
CREATE TABLE note_revisions (
    id              BIGSERIAL       PRIMARY KEY,
    note_id         UUID            NOT NULL,
    user_id         UUID            NOT NULL,
    title           VARCHAR(255)    NOT NULL,
    content         TEXT            NOT NULL,
    revised_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_revisions_note
        FOREIGN KEY (note_id) REFERENCES notes (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_revisions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_revisions_note_id ON note_revisions (note_id, revised_at DESC);

COMMENT ON TABLE note_revisions IS 'Historical snapshots of note edits';

-- -----------------------------------------------------------------------------
-- TRIGGERS — auto-update updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- -----------------------------------------------------------------------------
-- VIEWS — common queries
-- -----------------------------------------------------------------------------
CREATE VIEW v_user_note_counts AS
SELECT
    u.id            AS user_id,
    u.name,
    u.email,
    COUNT(n.id)     AS note_count,
    MAX(n.updated_at) AS last_note_updated_at
FROM users u
LEFT JOIN notes n ON n.user_id = u.id
GROUP BY u.id, u.name, u.email;
