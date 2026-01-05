const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('database.sqlite');
const outputFile = 'migration.sql';

const tables = [
    'users',
    'modules', 
    'client_modules', 
    'content_items', 
    'progress', 
    'uploaded_files', 
    'global_welcome_message', 
    'client_greetings'
];

const schema = {
    users: `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    password_hash TEXT,
    full_name TEXT,
    role TEXT,
    is_active INTEGER,
    access_expires TEXT,
    created_at TEXT,
    updated_at TEXT
  );`,
    modules: `CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    order_index INTEGER,
    icon TEXT,
    created_at TEXT,
    updated_at TEXT
  );`,
    client_modules: `CREATE TABLE IF NOT EXISTS client_modules (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    module_id TEXT,
    is_enabled INTEGER,
    created_at TEXT,
    updated_at TEXT
  );`,
    content_items: `CREATE TABLE IF NOT EXISTS content_items (
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
  );`,
    progress: `CREATE TABLE IF NOT EXISTS progress (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    module_id TEXT,
    content_item_id TEXT,
    completed INTEGER,
    completed_at TEXT,
    created_at TEXT,
    updated_at TEXT
  );`,
    uploaded_files: `CREATE TABLE IF NOT EXISTS uploaded_files (
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
  );`,
    global_welcome_message: `CREATE TABLE IF NOT EXISTS global_welcome_message (
    id TEXT PRIMARY KEY,
    title TEXT,
    message TEXT,
    is_active INTEGER,
    created_at TEXT,
    updated_at TEXT
  );`,
    client_greetings: `CREATE TABLE IF NOT EXISTS client_greetings (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    greeting_message TEXT,
    is_active INTEGER,
    created_at TEXT,
    updated_at TEXT
  );`
};

let sqlOutput = "-- Migration for Cloudflare D1\n\n";

db.serialize(() => {
    let completed = 0;

    tables.forEach(table => {
        // Add Schema
        sqlOutput += `-- Table: ${table}\n`;
        sqlOutput += `DROP TABLE IF EXISTS ${table};\n`;
        sqlOutput += schema[table] + "\n\n";

        // Add Data
        db.all(`SELECT * FROM ${table}`, (err, rows) => {
            if (err) {
                console.error(`Error reading ${table}:`, err);
                return;
            }

            if (rows.length > 0) {
                sqlOutput += `INSERT INTO ${table} VALUES \n`;
                const values = rows.map(row => {
                    const rowValues = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`; // Escape single quotes
                        return val;
                    });
                    return `(${rowValues.join(', ')})`;
                }).join(',\n');
                sqlOutput += values + ";\n\n";
            }

            completed++;
            if (completed === tables.length) {
                fs.writeFileSync(outputFile, sqlOutput);
                console.log(`Migration SQL written to ${outputFile}`);
                db.close();
            }
        });
    });
});
