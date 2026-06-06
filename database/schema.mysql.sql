-- =============================================================================
-- Notes App — MySQL Schema
-- =============================================================================
-- Run:  mysql -u root -p notes_app < schema.mysql.sql
-- =============================================================================

CREATE DATABASE IF NOT EXISTS notes_app
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE notes_app;

-- -----------------------------------------------------------------------------
-- USERS
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id              CHAR(36)        NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    KEY idx_users_created_at (created_at DESC),
    CONSTRAINT chk_users_email_lowercase CHECK (email = LOWER(email))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- NOTES
-- -----------------------------------------------------------------------------
CREATE TABLE notes (
    id              CHAR(36)        NOT NULL,
    user_id         CHAR(36)        NOT NULL,
    title           VARCHAR(255)    NOT NULL DEFAULT '',
    content         MEDIUMTEXT      NOT NULL,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    KEY idx_notes_user_id (user_id),
    KEY idx_notes_user_updated (user_id, updated_at DESC),
    KEY idx_notes_created_at (created_at DESC),

    CONSTRAINT fk_notes_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- USER SESSIONS
-- -----------------------------------------------------------------------------
CREATE TABLE user_sessions (
    id              CHAR(36)        NOT NULL,
    user_id         CHAR(36)        NOT NULL,
    token_hash      VARCHAR(255)    NOT NULL,
    expires_at      DATETIME(6)     NOT NULL,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(512),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    revoked_at      DATETIME(6)     NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_sessions_token_hash (token_hash),
    KEY idx_sessions_user_id (user_id),
    KEY idx_sessions_expires_at (expires_at),

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- ACTIVITY LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE activity_logs (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         CHAR(36)        NULL,
    event_type      VARCHAR(100)    NOT NULL,
    action          VARCHAR(100)    NOT NULL,
    metadata        JSON            NOT NULL DEFAULT (JSON_OBJECT()),
    ip_address      VARCHAR(45),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    KEY idx_activity_user_id (user_id),
    KEY idx_activity_event_type (event_type),
    KEY idx_activity_created_at (created_at DESC),

    CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- NOTE REVISIONS
-- -----------------------------------------------------------------------------
CREATE TABLE note_revisions (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    note_id         CHAR(36)        NOT NULL,
    user_id         CHAR(36)        NOT NULL,
    title           VARCHAR(255)    NOT NULL,
    content         MEDIUMTEXT      NOT NULL,
    revised_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    KEY idx_revisions_note_id (note_id, revised_at DESC),

    CONSTRAINT fk_revisions_note
        FOREIGN KEY (note_id) REFERENCES notes (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_revisions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- VIEW — user note counts
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
