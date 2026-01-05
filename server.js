const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = 3000;
const db = new sqlite3.Database('database.sqlite');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('.'));

// Generic handler helpers
const getTable = (tableName) => {
    const allowedTables = ['users', 'modules', 'client_modules', 'content_items', 'progress', 'uploaded_files', 'global_welcome_message', 'client_greetings'];
    if (allowedTables.includes(tableName)) return tableName;
    return null;
};

// GET all
app.get('/tables/:table', (req, res) => {
    const table = getTable(req.params.table);
    if (!table) return res.status(400).json({ error: 'Invalid table' });

    let query = `SELECT * FROM ${table}`;
    const params = [];

    if (req.query.sort) {
        const sortField = req.query.sort; 
        if (/^[a-z0-9_]+$/.test(sortField)) {
             query += ` ORDER BY ${sortField}`;
        }
    }
    
    if (req.query.limit) {
        query += ` LIMIT ?`;
        params.push(parseInt(req.query.limit));
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// GET one
app.get('/tables/:table/:id', (req, res) => {
    const table = getTable(req.params.table);
    if (!table) return res.status(400).json({ error: 'Invalid table' });

    db.get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(row);
    });
});

// POST create
app.post('/tables/:table', (req, res) => {
    const table = getTable(req.params.table);
    if (!table) return res.status(400).json({ error: 'Invalid table' });

    const data = req.body;
    if (!data.id) data.id = crypto.randomUUID();
    
    if (table === 'users' && !data.created_at) data.created_at = new Date().toISOString();

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(',');
    
    const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;

    db.run(sql, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

// PUT update
app.put('/tables/:table/:id', (req, res) => {
    const table = getTable(req.params.table);
    if (!table) return res.status(400).json({ error: 'Invalid table' });

    const data = req.body;
    const keys = Object.keys(data).filter(k => k !== 'id');
    const values = keys.map(k => data[k]);
    values.push(req.params.id);

    const setClause = keys.map(k => `${k} = ?`).join(',');

    if (keys.length === 0) return res.json(data); // Nothing to update

    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

    db.run(sql, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ ...data, id: req.params.id });
    });
});

// PATCH partial update
app.patch('/tables/:table/:id', (req, res) => {
    const table = getTable(req.params.table);
    if (!table) return res.status(400).json({ error: 'Invalid table' });

    const data = req.body;
    const keys = Object.keys(data).filter(k => k !== 'id');
    const values = keys.map(k => data[k]);
    values.push(req.params.id);

    const setClause = keys.map(k => `${k} = ?`).join(',');

    if (keys.length === 0) return res.json({ success: true }); // Nothing to update

    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

    db.run(sql, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// DELETE
app.delete('/tables/:table/:id', (req, res) => {
    const table = getTable(req.params.table);
    if (!table) return res.status(400).json({ error: 'Invalid table' });

    db.run(`DELETE FROM ${table} WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Fallback for SPA (if needed, but currently serving static files)
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
