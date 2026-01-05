const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    // Check for original_filename column in uploaded_files
    db.all("PRAGMA table_info(uploaded_files)", (err, columns) => {
        if (err) {
            console.error("Error getting table info:", err);
            return;
        }
        
        const hasOriginalFilename = columns.some(col => col.name === 'original_filename');
        
        if (!hasOriginalFilename) {
            console.log("Adding original_filename column to uploaded_files...");
            db.run("ALTER TABLE uploaded_files ADD COLUMN original_filename TEXT", (err) => {
                if (err) {
                    console.error("Error adding column:", err);
                } else {
                    console.log("Successfully added original_filename column.");
                }
            });
        } else {
            console.log("original_filename column already exists.");
        }
    });
});

setTimeout(() => {
    db.close();
}, 1000);
