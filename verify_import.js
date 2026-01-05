const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

const tables = [
    'users',
    'modules', 
    'content_items',
    'uploaded_files',
    'progress',
    'client_modules',
    'client_greetings'
];

db.serialize(() => {
    tables.forEach(table => {
        db.get(`SELECT count(*) as count FROM ${table}`, (err, row) => {
            if (err) console.error(err);
            else console.log(`${table}: ${row.count}`);
        });
    });
});

setTimeout(() => {
    db.close();
}, 1000);
