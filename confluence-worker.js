// Cloudflare Worker - Confluence API Proxy
// Bu worker CORS sorununu çözer ve GitHub Pages'den Confluence'a erişim sağlar

// IMPORTANT: Set these as Environment Variables in Cloudflare Worker settings!
// CONFLUENCE_EMAIL = yarkin.akcil@gusto.com
// CONFLUENCE_API_KEY = your-api-key
// CONFLUENCE_DOMAIN = gustohq.atlassian.net

export default {
  async fetch(request, env, ctx) {
    // Get credentials from environment variables
    const CONFLUENCE_EMAIL = env.CONFLUENCE_EMAIL;
    const CONFLUENCE_API_KEY = env.CONFLUENCE_API_KEY;
    const CONFLUENCE_DOMAIN = env.CONFLUENCE_DOMAIN || 'gustohq.atlassian.net';

    // Handle CORS preflight requests
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
      return new Response('Method not allowed', { 
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    try {
      // Check if environment variables are set
      if (!CONFLUENCE_EMAIL || !CONFLUENCE_API_KEY) {
        return new Response(JSON.stringify({ 
          error: 'Worker not configured',
          message: 'Please set CONFLUENCE_EMAIL and CONFLUENCE_API_KEY environment variables'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Get the search query from URL parameters
      const url = new URL(request.url);
      const query = url.searchParams.get('query');

      if (!query) {
        return new Response(JSON.stringify({ 
          error: 'Query parameter is required',
          example: '?query=payment+operations' 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Build Confluence API URL
      const confluenceUrl = `https://${CONFLUENCE_DOMAIN}/wiki/rest/api/content/search?cql=text~"${encodeURIComponent(query)}"&limit=10&expand=body.view,space`;

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
        throw new Error(`Confluence API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Return the results with CORS headers
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        details: 'Failed to fetch from Confluence API'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};


