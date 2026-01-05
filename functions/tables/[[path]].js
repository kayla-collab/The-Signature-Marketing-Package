export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = params.path; // Array from [[path]]

  // URL structure: /tables/:table or /tables/:table/:id
  const tableName = path[0];
  const id = path[1];

  const allowedTables = [
    'users', 
    'modules', 
    'client_modules', 
    'content_items', 
    'progress', 
    'uploaded_files', 
    'global_welcome_message', 
    'client_greetings'
  ];

  if (!allowedTables.includes(tableName)) {
    return new Response(JSON.stringify({ error: 'Invalid table' }), { status: 400 });
  }

  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    // GET
    if (request.method === 'GET') {
      if (id) {
        // Get one
        const stmt = env.DB.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).bind(id);
        const result = await stmt.first();
        if (!result) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
        return new Response(JSON.stringify(result), { headers });
      } else {
        // Get all
        let query = `SELECT * FROM ${tableName}`;
        let queryParams = [];

        // Sorting
        const sort = url.searchParams.get('sort');
        if (sort && /^[a-z0-9_]+$/.test(sort)) {
          query += ` ORDER BY ${sort}`;
        }

        // Limit
        const limit = url.searchParams.get('limit');
        if (limit) {
          query += ` LIMIT ?`;
          queryParams.push(parseInt(limit));
        }

        // Pagination (optional, based on standard pattern)
        const page = url.searchParams.get('page');
        if (page && limit) {
            const offset = (parseInt(page) - 1) * parseInt(limit);
            query += ` OFFSET ?`;
            queryParams.push(offset);
        }

        const stmt = env.DB.prepare(query).bind(...queryParams);
        const { results } = await stmt.all();
        return new Response(JSON.stringify({ data: results }), { headers });
      }
    }

    // POST
    if (request.method === 'POST') {
      const data = await request.json();
      if (!data.id) data.id = crypto.randomUUID();
      if (tableName === 'users' && !data.created_at) data.created_at = new Date().toISOString();
      if (!data.created_at) data.created_at = new Date().toISOString();
      if (!data.updated_at) data.updated_at = new Date().toISOString();

      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(',');

      const query = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`;
      await env.DB.prepare(query).bind(...values).run();

      return new Response(JSON.stringify(data), { headers });
    }

    // PUT
    if (request.method === 'PUT') {
      if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers });
      
      const data = await request.json();
      data.updated_at = new Date().toISOString();
      
      const keys = Object.keys(data).filter(k => k !== 'id');
      const values = keys.map(k => data[k]);
      values.push(id);

      if (keys.length === 0) return new Response(JSON.stringify(data), { headers });

      const setClause = keys.map(k => `${k} = ?`).join(',');
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
      
      await env.DB.prepare(query).bind(...values).run();
      
      return new Response(JSON.stringify({ ...data, id }), { headers });
    }

    // PATCH
    if (request.method === 'PATCH') {
      if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers });
      
      const data = await request.json();
      data.updated_at = new Date().toISOString();

      const keys = Object.keys(data).filter(k => k !== 'id');
      const values = keys.map(k => data[k]);
      values.push(id);

      if (keys.length === 0) return new Response(JSON.stringify({ success: true }), { headers });

      const setClause = keys.map(k => `${k} = ?`).join(',');
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
      
      await env.DB.prepare(query).bind(...values).run();
      
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // DELETE
    if (request.method === 'DELETE') {
      if (!id) return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers });
      
      await env.DB.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
