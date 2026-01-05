const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    // Check for source_type in uploaded_files
    db.all("PRAGMA table_info(uploaded_files)", (err, columns) => {
        if (err) {
            console.error("Error getting table info:", err);
            return;
        }
        
        const hasSourceType = columns.some(col => col.name === 'source_type');
        
        if (!hasSourceType) {
            console.log("Adding source_type column to uploaded_files...");
            db.run("ALTER TABLE uploaded_files ADD COLUMN source_type TEXT", (err) => {
                if (err) {
                    console.error("Error adding column:", err);
                } else {
                    console.log("Successfully added source_type column.");
                }
            });
        } else {
            console.log("source_type column already exists.");
        }
    });
});

setTimeout(() => {
    db.close();
}, 1000);
