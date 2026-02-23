exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8'
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  const space = process.env.CONTENTFUL_SPACE_ID;
  const cma = process.env.CONTENTFUL_CMA_TOKEN;
  const cda = process.env.CONTENTFUL_CDA_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';
  const locale = process.env.CONTENTFUL_LOCALE || 'en-US';
  if (!space) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing CONTENTFUL_SPACE_ID' }) };
  if (!cda) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing CONTENTFUL_CDA_TOKEN' }) };

  function esc(s){return String(s||'');}

  if (event.httpMethod === 'GET') {
    const slug = event.queryStringParameters && event.queryStringParameters.slug || '';
    const limit = Math.min(100, Math.max(1, parseInt((event.queryStringParameters && event.queryStringParameters.limit) || '50', 10) || 50));
    if (!slug) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing slug' }) };
    const url = new URL(`https://cdn.contentful.com/spaces/${space}/environments/${environment}/entries`);
    const params = url.searchParams;
    params.set('content_type', 'comment');
    params.set('fields.postSlug', slug);
    params.set('order', '-sys.createdAt');
    params.set('limit', String(limit));
    try {
      const r = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${cda}`, 'Accept': 'application/json' }
      });
      if (!r.ok) {
        const t = await r.text();
        return { statusCode: r.status, headers, body: JSON.stringify({ error: 'Upstream error', detail: t }) };
      }
      const data = await r.json();
      const items = (data.items || []).map(it => {
        const f = it.fields || {};
        return {
          id: it.sys && it.sys.id,
          name: (f.name && f.name[locale]) || (f.name && f.name['en-US']) || 'Anonimno',
          message: (f.message && f.message[locale]) || (f.message && f.message['en-US']) || '',
          createdAt: it.sys && it.sys.createdAt
        };
      });
      return { statusCode: 200, headers, body: JSON.stringify({ items }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error', detail: String(e && e.message || e) }) };
    }
  }

  if (event.httpMethod === 'POST') {
    if (!cma) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing CONTENTFUL_CMA_TOKEN' }) };
    try {
      const data = JSON.parse(event.body || '{}');
      // Basic anti-spam: honeypot
      if (data.website) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad request' }) };
      const slug = esc(data.slug || '');
      const name = esc(data.name || '').slice(0, 120);
      const email = esc(data.email || '').slice(0, 200);
      const message = esc(data.message || '').slice(0, 5000);
      if (!slug || !name || !message) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields' }) };
      // Create entry
      const createUrl = `https://api.contentful.com/spaces/${space}/environments/${environment}/entries`;
      const payload = {
        fields: {
          postSlug: { [locale]: slug },
          name: { [locale]: name },
          email: { [locale]: email || '' },
          message: { [locale]: message }
        }
      };
      const resp = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cma}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json',
          'X-Contentful-Content-Type': 'comment'
        },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const t = await resp.text();
        return { statusCode: resp.status, headers, body: JSON.stringify({ error: 'Create failed', detail: t }) };
      }
      const created = await resp.json();
      // Publish
      const entryId = created.sys && created.sys.id;
      const version = created.sys && created.sys.version;
      if (entryId && version) {
        const pub = await fetch(`https://api.contentful.com/spaces/${space}/environments/${environment}/entries/${entryId}/published`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${cma}`,
            'X-Contentful-Version': String(version)
          }
        });
        if (!pub.ok) {
          const t = await pub.text();
          return { statusCode: pub.status, headers, body: JSON.stringify({ error: 'Publish failed', detail: t }) };
        }
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error', detail: String(e && e.message || e) }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
};

