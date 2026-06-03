-- ── Inventory module ──────────────────────────────────────────────────────────

-- Brands catalog
CREATE TABLE t200_brands (
    t200_brands_id  UUID         NOT NULL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ  NOT NULL,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    deleted_at      TIMESTAMPTZ
);

-- Item categories catalog (tipos de material)
CREATE TABLE t200_item_categories (
    t200_item_categories_id UUID         NOT NULL PRIMARY KEY,
    code                    VARCHAR(50),
    name                    VARCHAR(150) NOT NULL,
    description             TEXT,
    created_at              TIMESTAMPTZ  NOT NULL,
    updated_at              TIMESTAMPTZ  NOT NULL,
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100),
    deleted_at              TIMESTAMPTZ
);

-- Item statuses catalog
CREATE TABLE t200_item_statuses (
    t200_item_statuses_id UUID         NOT NULL PRIMARY KEY,
    code                  VARCHAR(50),
    name                  VARCHAR(150) NOT NULL,
    description           TEXT,
    created_at            TIMESTAMPTZ  NOT NULL,
    updated_at            TIMESTAMPTZ  NOT NULL,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100),
    deleted_at            TIMESTAMPTZ
);

-- Warehouse entry types catalog
CREATE TABLE t200_warehouse_entry_types (
    t200_warehouse_entry_types_id UUID         NOT NULL PRIMARY KEY,
    code                          VARCHAR(50),
    name                          VARCHAR(150) NOT NULL,
    description                   TEXT,
    created_at                    TIMESTAMPTZ  NOT NULL,
    updated_at                    TIMESTAMPTZ  NOT NULL,
    created_by                    VARCHAR(100),
    updated_by                    VARCHAR(100),
    deleted_at                    TIMESTAMPTZ
);

-- Warehouses
CREATE TABLE t100_warehouses (
    t100_warehouses_id UUID         NOT NULL PRIMARY KEY,
    name               VARCHAR(200) NOT NULL,
    description        TEXT,
    is_reception       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ  NOT NULL,
    updated_at         TIMESTAMPTZ  NOT NULL,
    created_by         VARCHAR(100),
    updated_by         VARCHAR(100),
    deleted_at         TIMESTAMPTZ
);

-- Inventory items (main entity)
CREATE TABLE t100_inventory_items (
    t100_inventory_items_id     UUID         NOT NULL PRIMARY KEY,
    t200_item_categories_id     UUID         NOT NULL REFERENCES t200_item_categories(t200_item_categories_id),
    t200_brands_id              UUID         REFERENCES t200_brands(t200_brands_id),
    t200_item_statuses_id       UUID         REFERENCES t200_item_statuses(t200_item_statuses_id),
    t100_warehouses_id          UUID         REFERENCES t100_warehouses(t100_warehouses_id),
    serial_number               VARCHAR(100),
    model                       VARCHAR(150),
    notes                       TEXT,
    created_at                  TIMESTAMPTZ  NOT NULL,
    updated_at                  TIMESTAMPTZ  NOT NULL,
    created_by                  VARCHAR(100),
    updated_by                  VARCHAR(100),
    deleted_at                  TIMESTAMPTZ
);

CREATE INDEX idx_t100_inventory_items_category  ON t100_inventory_items(t200_item_categories_id);
CREATE INDEX idx_t100_inventory_items_brand     ON t100_inventory_items(t200_brands_id);
CREATE INDEX idx_t100_inventory_items_status    ON t100_inventory_items(t200_item_statuses_id);
CREATE INDEX idx_t100_inventory_items_warehouse ON t100_inventory_items(t100_warehouses_id);
