const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    // Check if file_size column exists in uploaded_files
    db.all("PRAGMA table_info(uploaded_files)", (err, columns) => {
        if (err) {
            console.error("Error getting table info:", err);
            return;
        }
        
        const hasFileSize = columns.some(col => col.name === 'file_size');
        
        if (!hasFileSize) {
            console.log("Adding file_size column to uploaded_files...");
            db.run("ALTER TABLE uploaded_files ADD COLUMN file_size INTEGER", (err) => {
                if (err) {
                    console.error("Error adding column:", err);
                } else {
                    console.log("Successfully added file_size column.");
                }
            });
        } else {
            console.log("file_size column already exists.");
        }
    });
});

setTimeout(() => {
    db.close();
}, 1000);
