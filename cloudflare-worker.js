// Cloudflare Worker - Confluence API Proxy
// This worker acts as a proxy to bypass CORS restrictions

const CONFLUENCE_EMAIL = 'yarkin.akcil@gusto.com';
const CONFLUENCE_API_KEY = 'ATATT3xFfGF0DPdNek3hkIdA_A-AB3dc_RJ4qtMCuzTz-NJLvruBn9WOtIc3XcLCUhXCC02zbi0hfFcMLmwuR1E3pl-C0MUjnK82eqKFUZyeJ2IB08SHXcYQw5IrdO-KNv4uUKCm2-9--SuagbRC4o1aXDlmiFzD1z6vWvUR7UOGdxiaRkid2Pk=2117C5E8';
const CONFLUENCE_DOMAIN = 'gustohq.atlassian.net';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Get the search query from URL parameters
      const url = new URL(request.url);
      const query = url.searchParams.get('query');

      if (!query) {
        return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Build Confluence API URL
      const confluenceUrl = `https://${CONFLUENCE_DOMAIN}/wiki/rest/api/content/search?cql=text~"${encodeURIComponent(query)}"&limit=5&expand=body.view,space`;

      // Create Basic Auth header
      const authString = btoa(`${CONFLUENCE_EMAIL}:${CONFLUENCE_API_KEY}`);

      // Make request to Confluence API
      const response = await fetch(confluenceUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Confluence API error: ${response.status}`);
      }

      const data = await response.json();

      // Return the results with CORS headers
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};




