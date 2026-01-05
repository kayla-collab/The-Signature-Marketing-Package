const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('database.sqlite');
const importFile = '/home/user/uploaded_files/tsmp-export-2026-01-05.json.txt';

console.log(`Starting direct import from ${importFile}...`);

try {
    const rawData = fs.readFileSync(importFile, 'utf8');
    const importData = JSON.parse(rawData);
    
    console.log(`Loaded export data version ${importData.version} from ${importData.source}`);
    
    const tables = [
        'users',
        'modules', 
        'content_items',
        'uploaded_files',
        'progress',
        'client_modules',
        'client_greetings',
        'global_welcome_message'
    ];
    
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        tables.forEach(table => {
            const records = importData.tables[table] || [];
            if (records.length === 0) {
                console.log(`Skipping ${table} - no records`);
                return;
            }
            
            console.log(`Importing ${records.length} records into ${table}...`);
            
            let imported = 0;
            let errors = 0;
            
            const stmt = db.prepare(`INSERT OR REPLACE INTO ${table} (${Object.keys(records[0]).filter(k => !k.startsWith('_') && k !== 'gs_project_id' && k !== 'gs_table_name' && k !== 'deleted').join(',')}) VALUES (${Object.keys(records[0]).filter(k => !k.startsWith('_') && k !== 'gs_project_id' && k !== 'gs_table_name' && k !== 'deleted').map(() => '?').join(',')})`);
            
            records.forEach(record => {
                // Filter out system fields
                const cleanRecord = {};
                Object.keys(record).forEach(key => {
                    if (!key.startsWith('_') && key !== 'gs_project_id' && key !== 'gs_table_name' && key !== 'deleted') {
                        cleanRecord[key] = record[key];
                    }
                });
                
                try {
                    stmt.run(Object.values(cleanRecord));
                    imported++;
                } catch (e) {
                    console.error(`Error importing record into ${table}:`, e.message);
                    errors++;
                }
            });
            
            stmt.finalize();
            console.log(`Finished ${table}: ${imported} imported, ${errors} errors`);
        });
        
        db.run("COMMIT", (err) => {
            if (err) {
                console.error("Transaction commit failed:", err);
            } else {
                console.log("All data imported successfully!");
            }
        });
    });
    
} catch (err) {
    console.error("Import failed:", err);
}

setTimeout(() => {
    db.close();
}, 2000);
