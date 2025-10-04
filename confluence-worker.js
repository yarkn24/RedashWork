// Cloudflare Worker - Simple Confluence Search
export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Use POST method' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    try {
      // Get question
      const body = await request.json();
      const question = body.question;

      if (!question) {
        return new Response(JSON.stringify({ error: 'Question required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Get env vars
      const email = env.CONFLUENCE_EMAIL;
      const apiKey = env.CONFLUENCE_API_KEY;
      const domain = env.CONFLUENCE_DOMAIN || 'gustohq.atlassian.net';

      // Check env vars
      if (!email || !apiKey) {
        return new Response(JSON.stringify({ 
          error: 'Missing credentials',
          answer: 'Worker not configured properly.'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Search Confluence
      const auth = btoa(`${email}:${apiKey}`);
      const url = `https://${domain}/wiki/rest/api/content/search?cql=text~"${encodeURIComponent(question)}"&limit=10&expand=body.view,space`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Confluence API error: ${response.status}`);
      }

      const data = await response.json();
      const results = data.results || [];

      // No results
      if (results.length === 0) {
        return new Response(JSON.stringify({
          answer: "I couldn't find any articles about your question.",
          articles: []
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Build summary
      let summary = `I found ${results.length} article${results.length > 1 ? 's' : ''} about "${question}".\n\n`;
      
      results.forEach((article, i) => {
        const text = cleanText(article.body?.view?.value || '', 150);
        summary += `${i + 1}. **${article.title}** (${article.space?.name || 'Unknown'})\n${text}\n\n`;
      });

      // Build articles list
      const articles = results.map(article => ({
        title: article.title,
        space: article.space?.name || 'Unknown',
        url: `https://${domain}/wiki${article._links.webui}`,
        excerpt: cleanText(article.body?.view?.value || '', 150)
      }));

      return new Response(JSON.stringify({
        answer: summary,
        articles: articles
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message,
        answer: "I'm having trouble right now. Please try again."
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

function cleanText(html, maxLength) {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
