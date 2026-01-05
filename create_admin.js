const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
const crypto = require('crypto');

const adminId = 'admin-user-id';
const email = 'kayla@kaylasierra.com';

db.serialize(() => {
    db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        if (!row) {
            const stmt = db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            stmt.run(adminId, email, 'admin123', 'Kayla Sierra', 'admin', 1, null, new Date().toISOString(), (err) => {
                if (err) console.error("Insert failed:", err);
                else console.log("Admin user created.");
            });
            stmt.finalize();
        } else {
            console.log("Admin user already exists.");
        }
    });
});
// Wait a bit before closing to ensure async ops finish (lazy way, or put close in callback)
setTimeout(() => {
    db.close();
}, 1000);
