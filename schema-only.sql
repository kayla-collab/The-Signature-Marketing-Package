-- Schema Creation Only

-- Table: users
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    password_hash TEXT,
    full_name TEXT,
    role TEXT,
    is_active INTEGER,
    access_expires TEXT,
    created_at TEXT,
    updated_at TEXT
  );

-- Table: modules
DROP TABLE IF EXISTS modules;
CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    order_index INTEGER,
    icon TEXT,
    created_at TEXT,
    updated_at TEXT
  );

-- Table: client_modules
DROP TABLE IF EXISTS client_modules;
CREATE TABLE IF NOT EXISTS client_modules (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    module_id TEXT,
    is_enabled INTEGER,
    created_at TEXT,
    updated_at TEXT
  );

-- Table: content_items
DROP TABLE IF EXISTS content_items;
CREATE TABLE IF NOT EXISTS content_items (
    id TEXT PRIMARY KEY,
    module_id TEXT,
    client_id TEXT,
    title TEXT,
    content_type TEXT,
    content_body TEXT,
    content_url TEXT,
    order_index INTEGER,
    created_at TEXT,
    updated_at TEXT
  );

-- Table: progress
DROP TABLE IF EXISTS progress;
CREATE TABLE IF NOT EXISTS progress (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    module_id TEXT,
    content_item_id TEXT,
    completed INTEGER,
    completed_at TEXT,
    created_at TEXT,
    updated_at TEXT
  );

-- Table: uploaded_files
DROP TABLE IF EXISTS uploaded_files;
CREATE TABLE IF NOT EXISTS uploaded_files (
    id TEXT PRIMARY KEY,
    file_name TEXT,
    file_type TEXT,
    file_url TEXT,
    description TEXT,
    allow_download INTEGER,
    allow_copy INTEGER,
    file_size INTEGER,
    original_filename TEXT,
    source_type TEXT,
    created_at TEXT,
    updated_at TEXT
  );

-- Table: global_welcome_message
DROP TABLE IF EXISTS global_welcome_message;
CREATE TABLE IF NOT EXISTS global_welcome_message (
    id TEXT PRIMARY KEY,
    title TEXT,
    message TEXT,
    is_active INTEGER,
    created_at TEXT,
    updated_at TEXT
  );

-- Table: client_greetings
DROP TABLE IF EXISTS client_greetings;
CREATE TABLE IF NOT EXISTS client_greetings (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    greeting_message TEXT,
    is_active INTEGER,
    created_at TEXT,
    updated_at TEXT
  );
