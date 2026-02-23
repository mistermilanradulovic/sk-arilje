exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8'
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  try {
    const space = process.env.CONTENTFUL_SPACE_ID;
    const token = process.env.CONTENTFUL_CDA_TOKEN;
    const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';
    if (!space || !token) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing Contentful credentials' }) };
    }
    const url = new URL(`https://cdn.contentful.com/spaces/${space}/environments/${environment}/entries`);
    const params = url.searchParams;
    const q = (event.queryStringParameters && event.queryStringParameters.q) ? String(event.queryStringParameters.q) : '';
    const page = Math.max(1, parseInt((event.queryStringParameters && event.queryStringParameters.page) || '1', 10) || 1);
    const pageSize = Math.min(24, Math.max(1, parseInt((event.queryStringParameters && event.queryStringParameters.pageSize) || '6', 10) || 6));
    const categories = (event.queryStringParameters && event.queryStringParameters.categories) ? String(event.queryStringParameters.categories) : '';
    const tags = (event.queryStringParameters && event.queryStringParameters.tags) ? String(event.queryStringParameters.tags) : '';
    params.set('content_type', 'blogPost');
    // Order newest first by explicit date, then by creation time as a secondary key
    params.set('order', '-fields.date,-sys.createdAt');
    params.set('limit', String(pageSize));
    params.set('skip', String((page - 1) * pageSize));
    params.set('include', '2');
    if (q) params.set('query', q);
    if (categories) {
      // match simple text categories
      params.append('fields.categories[in]', categories);
      params.append('fields.category[in]', categories);
      // if you use reference categories with sys.id, you can also pass categoryIds=...
      if (event.queryStringParameters && event.queryStringParameters.categoryIds) {
        params.append('fields.categories.sys.id[in]', String(event.queryStringParameters.categoryIds));
      }
    }
    if (tags) {
      params.append('fields.tags[in]', tags);
      params.append('fields.tag[in]', tags);
      // system tags
      params.append('metadata.tags.sys.id[in]', tags);
    }
    const resp = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.contentful.delivery.v1+json',
        'Accept': 'application/json'
      }
    });
    if (!resp.ok) {
      const txt = await resp.text();
      return { statusCode: resp.status, headers, body: JSON.stringify({ error: 'Upstream error', detail: txt }) };
    }
    const data = await resp.json();
    const includesAssets = {};
    if (data.includes && Array.isArray(data.includes.Asset)) {
      data.includes.Asset.forEach(a => { includesAssets[a.sys && a.sys.id] = a; });
    }
    function fileUrlFromAssetLink(link) {
      try {
        const id = link && link.sys && link.sys.id;
        if (!id) return '';
        const asset = includesAssets[id];
        const url = asset && asset.fields && asset.fields.file && asset.fields.file.url;
        if (!url) return '';
        return url.startsWith('//') ? `https:${url}` : url;
      } catch (_) { return ''; }
    }
    function buildImageUrl(u, params) {
      if (!u) return '';
      const joiner = u.includes('?') ? '&' : '?';
      return `${u}${joiner}${params}`;
    }
    const items = (data.items || []).map(item => {
      const f = item.fields || {};
      const title = f.title || 'Bez naslova';
      const slug = (f.slug || (title && title.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))) || item.sys.id;
      const date = f.date || item.sys.createdAt;
      const description = f.description || '';
      let hero = '';
      if (f.heroImage && f.heroImage.sys) {
        hero = fileUrlFromAssetLink(f.heroImage);
      }
      const heroThumb = hero ? buildImageUrl(hero, 'w=720&h=400&fit=fill&fm=webp&q=80') : '';
      const heroContent = hero ? buildImageUrl(hero, 'w=1280&fm=webp&q=82') : '';
      const heroFull = hero ? buildImageUrl(hero, 'w=1920&fm=webp&q=82') : '';
      return {
        id: item.sys.id,
        title,
        slug,
        date,
        description,
        heroImage: hero,
        heroThumb,
        heroContent,
        heroFull
      };
    });
    const body = JSON.stringify({
      total: data.total || 0,
      skip: data.skip || 0,
      limit: data.limit || pageSize,
      page,
      pageSize,
      items
    });
    return { statusCode: 200, headers, body };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error', detail: String(err && err.message || err) }) };
  }
};

