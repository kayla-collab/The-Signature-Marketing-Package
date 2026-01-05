const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  // users
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    password_hash TEXT,
    full_name TEXT,
    role TEXT,
    is_active INTEGER,
    access_expires TEXT,
    created_at TEXT
  )`);

  // modules
  db.run(`CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    order_index INTEGER,
    icon TEXT
  )`);

  // client_modules
  db.run(`CREATE TABLE IF NOT EXISTS client_modules (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    module_id TEXT,
    is_enabled INTEGER
  )`);

  // content_items
  db.run(`CREATE TABLE IF NOT EXISTS content_items (
    id TEXT PRIMARY KEY,
    module_id TEXT,
    client_id TEXT,
    title TEXT,
    content_type TEXT,
    content_body TEXT,
    content_url TEXT,
    order_index INTEGER
  )`);

  // progress
  db.run(`CREATE TABLE IF NOT EXISTS progress (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    module_id TEXT,
    content_item_id TEXT,
    completed INTEGER,
    completed_at TEXT
  )`);

  // uploaded_files
  db.run(`CREATE TABLE IF NOT EXISTS uploaded_files (
    id TEXT PRIMARY KEY,
    file_name TEXT,
    file_type TEXT,
    file_url TEXT,
    description TEXT,
    allow_download INTEGER,
    allow_copy INTEGER
  )`);

  // global_welcome_message
  db.run(`CREATE TABLE IF NOT EXISTS global_welcome_message (
    id TEXT PRIMARY KEY,
    title TEXT,
    message TEXT,
    is_active INTEGER
  )`);

  // client_greetings
  db.run(`CREATE TABLE IF NOT EXISTS client_greetings (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    greeting_message TEXT,
    is_active INTEGER
  )`);

  // Create default admin user if not exists
  const adminId = 'admin-user-id';
  db.get("SELECT id FROM users WHERE email = ?", ['kayla@kaylasierra.com'], (err, row) => {
    if (!row) {
        const stmt = db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        stmt.run(adminId, 'kayla@kaylasierra.com', 'admin123', 'Kayla Sierra', 'admin', 1, null, new Date().toISOString());
        stmt.finalize();
        console.log("Admin user created.");
    } else {
        console.log("Admin user already exists.");
    }
  });

});

db.close();
