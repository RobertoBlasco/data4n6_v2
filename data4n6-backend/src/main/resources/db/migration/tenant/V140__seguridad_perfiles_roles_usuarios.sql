-- ── t900_perfiles ────────────────────────────────────────────────────────────
CREATE TABLE seguridad.t900_perfiles (
    t900_perfiles_id  UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre            VARCHAR(100) NOT NULL,
    descripcion       TEXT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,
    CONSTRAINT t900_perfiles_nombre_unique UNIQUE (nombre)
);

-- ── t900_roles ────────────────────────────────────────────────────────────────
CREATE TABLE seguridad.t900_roles (
    t900_roles_id     UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre            VARCHAR(100) NOT NULL,
    descripcion       TEXT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,
    CONSTRAINT t900_roles_nombre_unique UNIQUE (nombre)
);

-- ── t900_usuarios ─────────────────────────────────────────────────────────────
CREATE TABLE seguridad.t900_usuarios (
    t900_usuarios_id  UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    username          VARCHAR(100) NOT NULL,
    email             VARCHAR(200) NOT NULL,
    nombre            VARCHAR(100),
    apellidos         VARCHAR(200),
    t900_perfiles_id  UUID         REFERENCES seguridad.t900_perfiles(t900_perfiles_id),
    is_active         BOOLEAN      NOT NULL DEFAULT true,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,
    CONSTRAINT t900_usuarios_username_unique UNIQUE (username),
    CONSTRAINT t900_usuarios_email_unique    UNIQUE (email)
);

-- ── t900_usuarios_roles (relación N:N) ────────────────────────────────────────
CREATE TABLE seguridad.t900_usuarios_roles (
    t900_usuarios_id  UUID NOT NULL REFERENCES seguridad.t900_usuarios(t900_usuarios_id),
    t900_roles_id     UUID NOT NULL REFERENCES seguridad.t900_roles(t900_roles_id),
    PRIMARY KEY (t900_usuarios_id, t900_roles_id)
);

-- ── t900_perfiles_roles (roles por perfil) ────────────────────────────────────
CREATE TABLE seguridad.t900_perfiles_roles (
    t900_perfiles_id  UUID NOT NULL REFERENCES seguridad.t900_perfiles(t900_perfiles_id),
    t900_roles_id     UUID NOT NULL REFERENCES seguridad.t900_roles(t900_roles_id),
    PRIMARY KEY (t900_perfiles_id, t900_roles_id)
);

-- ── Índices ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_t900_usuarios_perfil   ON seguridad.t900_usuarios(t900_perfiles_id);
CREATE INDEX idx_t900_usuarios_roles_u  ON seguridad.t900_usuarios_roles(t900_usuarios_id);
CREATE INDEX idx_t900_usuarios_roles_r  ON seguridad.t900_usuarios_roles(t900_roles_id);
CREATE INDEX idx_t900_perfiles_roles_p  ON seguridad.t900_perfiles_roles(t900_perfiles_id);
CREATE INDEX idx_t900_perfiles_roles_r  ON seguridad.t900_perfiles_roles(t900_roles_id);
