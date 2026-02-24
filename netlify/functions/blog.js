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
    const categoryIdsParam = (event.queryStringParameters && event.queryStringParameters.categoryIds) ? String(event.queryStringParameters.categoryIds) : '';
    const categoryIds = categoryIdsParam ? categoryIdsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
    const tags = (event.queryStringParameters && event.queryStringParameters.tags) ? String(event.queryStringParameters.tags) : '';
    const aggregate = (event.queryStringParameters && event.queryStringParameters.aggregate) ? (String(event.queryStringParameters.aggregate).toLowerCase() === '1' || String(event.queryStringParameters.aggregate).toLowerCase() === 'true') : false;
    params.set('content_type', 'blogPost');
    // Order newest first by explicit date, then by creation time as a secondary key
    params.set('order', '-fields.date,-sys.createdAt');
    if (aggregate) {
      // compute category/tag counts across many entries
    } else {
      params.set('limit', String(pageSize));
      params.set('skip', String((page - 1) * pageSize));
      params.set('include', '2');
    }
    if (q) params.set('query', q);
    if (categories) {
      // match simple text categories
      params.append('fields.categories[in]', categories);
      params.append('fields.category[in]', categories);
      // if you use reference categories with sys.id, you can also pass categoryIds=...
      if (event.queryStringParameters && event.queryStringParameters.categoryIds) {
        params.append('fields.categories.sys.id[in]', String(event.queryStringParameters.categoryIds));
      }
      // Try matching referenced Category entry titles as well
      params.append('fields.categories.fields.title[in]', categories);
      params.append('fields.category.fields.title[in]', categories);
    }
    if (tags) {
      params.append('fields.tags[in]', tags);
      params.append('fields.tag[in]', tags);
      // system tags
      params.append('metadata.tags.sys.id[in]', tags);
    }
    if (aggregate) {
      async function fetchBatch(skip, limit) {
        const u = new URL(url.toString());
        const p = u.searchParams;
        p.set('select', 'fields.categories,fields.category,metadata.tags');
        p.set('limit', String(limit));
        p.set('skip', String(skip));
        const r = await fetch(u.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/vnd.contentful.delivery.v1+json',
            'Accept': 'application/json'
          }
        });
        if (!r.ok) {
          const txt = await r.text();
          return { statusCode: r.status, headers, body: JSON.stringify({ error: 'Upstream error', detail: txt }) };
        }
        return r.json();
      }
      let total = 0;
      let skip = 0;
      const limit = 500;
      const catCounts = {};
      const catNameToIds = {}; // name -> Set(ids)
      const tagCounts = {};
      const normArr = v => Array.isArray(v) ? v : (typeof v === 'string' ? v.split(',').map(s=>s.trim()).filter(Boolean) : (v ? [v] : []));
      const label = v => (typeof v === 'string') ? v : (v && v.fields && (v.fields.title || v.fields.name)) ? (v.fields.title || v.fields.name) : (v && v.sys && v.sys.id) ? v.sys.id : '';
      const linkId = v => (v && v.sys && v.sys.id) ? v.sys.id : '';
      do {
        const data = await fetchBatch(skip, limit);
        if (data.statusCode) return data; // error bubbled
        total = data.total || 0;
        (data.items || []).forEach(item => {
          const f = item.fields || {};
          normArr(f.categories).forEach(v => {
            const l = label(v);
            if (l) {
              catCounts[l] = (catCounts[l]||0)+1;
              const id = linkId(v);
              if (id) {
                if (!catNameToIds[l]) catNameToIds[l] = new Set();
                catNameToIds[l].add(id);
              }
            }
          });
          if (f.category) {
            const l = label(f.category);
            if (l) {
              catCounts[l] = (catCounts[l]||0)+1;
              const id = linkId(f.category);
              if (id) {
                if (!catNameToIds[l]) catNameToIds[l] = new Set();
                catNameToIds[l].add(id);
              }
            }
          }
          normArr(f.tags).forEach(v => { const l = label(v); if (l) tagCounts[l] = (tagCounts[l]||0)+1; });
          if (f.tag) { const l = label(f.tag); if (l) tagCounts[l] = (tagCounts[l]||0)+1; }
          if (item.metadata && Array.isArray(item.metadata.tags)) {
            item.metadata.tags.forEach(t => { if (t && t.sys && t.sys.id) tagCounts[t.sys.id] = (tagCounts[t.sys.id]||0)+1; });
          }
        });
        skip += limit;
      } while (skip < total);
      const categoriesDetailed = Object.keys(catCounts).sort((a,b)=>a.localeCompare(b)).map(name => ({
        name,
        count: catCounts[name] || 0,
        ids: Array.from(catNameToIds[name] || [])
      }));
      return { statusCode: 200, headers, body: JSON.stringify({ categories: catCounts, categoriesDetailed, tags: tagCounts, total }) };
    }
    // Helper to resolve category names to entry IDs (for referenced Category content type)
    async function resolveCategoryIdsByNames(namesCsv) {
      const names = String(namesCsv || '').split(',').map(s => s.trim()).filter(Boolean);
      if (!names.length) return [];
      const u = new URL(`https://cdn.contentful.com/spaces/${space}/environments/${environment}/entries`);
      const p = u.searchParams;
      p.set('content_type', 'category');
      // attempt match by title in any locale
      p.set('fields.title[in]', names.join(','));
      p.set('locale', '*');
      p.set('limit', '1000');
      const r = await fetch(u.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!r.ok) return [];
      const data = await r.json();
      const out = [];
      (data.items || []).forEach(it => {
        if (it && it.sys && it.sys.id) out.push(it.sys.id);
      });
      return out;
    }

    let effectiveCategoryIds = categoryIds.slice();
    if (!effectiveCategoryIds.length && categories) {
      try {
        const resolved = await resolveCategoryIdsByNames(categories);
        if (resolved && resolved.length) {
          effectiveCategoryIds = resolved;
        }
      } catch (e) {
        // ignore resolution errors; will fall back to name-based filtering below
      }
    }

    // If we have referenced category IDs, fetch union via multiple requests and merge
    if (effectiveCategoryIds.length > 0) {
      // Build from base to avoid inherited limit/skip interfering with union fetches
      function baseUrl() {
        const u = new URL(`https://cdn.contentful.com/spaces/${space}/environments/${environment}/entries`);
        const p = u.searchParams;
        p.set('content_type', 'blogPost');
        p.set('include', '2');
        // order not critical for union fetch, we'll sort after merge
        if (q) p.set('query', q);
        if (tags) {
          p.set('fields.tags[in]', tags);
          p.set('fields.tag[in]', tags);
          p.set('metadata.tags.sys.id[in]', tags);
        }
        return u;
      }
      async function fetchForLink(id) {
        const u = baseUrl();
        const p = u.searchParams;
        p.set('links_to_entry', id);
        // fetch generously; we'll paginate after merging
        p.set('limit', '1000');
        p.delete('skip');
        const r = await fetch(u.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/vnd.contentful.delivery.v1+json',
            'Accept': 'application/json'
          }
        });
        if (!r.ok) {
          const txt = await r.text();
          throw new Error(`Upstream error ${r.status}: ${txt}`);
        }
        return r.json();
      }
      const allItemsMap = new Map();
      const includesAssets = {};
      for (const id of effectiveCategoryIds) {
        try {
          const data = await fetchForLink(id);
          if (data.includes && Array.isArray(data.includes.Asset)) {
            data.includes.Asset.forEach(a => { includesAssets[a.sys && a.sys.id] = a; });
          }
          (data.items || []).forEach(item => {
            if (item && item.sys && item.sys.id && !allItemsMap.has(item.sys.id)) {
              allItemsMap.set(item.sys.id, item);
            }
          });
        } catch (e) {
          // continue on individual fetch errors
        }
      }
      // convert to array and sort newest first
      let merged = Array.from(allItemsMap.values());
      merged.sort((a, b) => {
        const da = (a.fields && (a.fields.date || a.sys && a.sys.createdAt)) ? new Date(a.fields.date || a.sys.createdAt).getTime() : 0;
        const db = (b.fields && (b.fields.date || b.sys && b.sys.createdAt)) ? new Date(b.fields.date || b.sys.createdAt).getTime() : 0;
        return db - da;
      });
      const total = merged.length;
      const start = (page - 1) * pageSize;
      const slice = merged.slice(start, start + pageSize);
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
      const items = slice.map(item => {
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
        return { id: item.sys.id, title, slug, date, description, heroImage: hero, heroThumb, heroContent, heroFull };
      });
      const body = JSON.stringify({ total, skip: start, limit: pageSize, page, pageSize, items });
      return { statusCode: 200, headers, body };
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

