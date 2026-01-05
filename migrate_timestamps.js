const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

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

db.serialize(() => {
    tables.forEach(table => {
        db.all(`PRAGMA table_info(${table})`, (err, columns) => {
            if (err) {
                console.error(`Error getting info for ${table}:`, err);
                return;
            }
            
            const hasCreatedAt = columns.some(col => col.name === 'created_at');
            const hasUpdatedAt = columns.some(col => col.name === 'updated_at');
            
            if (!hasCreatedAt) {
                console.log(`Adding created_at to ${table}...`);
                db.run(`ALTER TABLE ${table} ADD COLUMN created_at TEXT`, (err) => {
                    if (err) console.error(`Failed to add created_at to ${table}:`, err);
                });
            }
            
            if (!hasUpdatedAt) {
                console.log(`Adding updated_at to ${table}...`);
                db.run(`ALTER TABLE ${table} ADD COLUMN updated_at TEXT`, (err) => {
                    if (err) console.error(`Failed to add updated_at to ${table}:`, err);
                });
            }
        });
    });
});

setTimeout(() => {
    db.close();
    console.log("Migration complete.");
}, 2000);
