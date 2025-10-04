// Cloudflare Worker - Simple Confluence Search (No AI)
// This version works without AI to debug the issue

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
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: 'Method not allowed',
        message: 'Please use POST method with JSON body containing "question" field'
      }), { 
        status: 405,
        headers: {
          'Content-Type': 'application/json',
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

      // Parse the request body
      const body = await request.json();
      const userQuestion = body.question;

      if (!userQuestion) {
        return new Response(JSON.stringify({ 
          error: 'Question is required',
          message: 'Please provide a "question" field in the JSON body'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Search Confluence
      const searchResults = await searchConfluence(
        userQuestion, 
        CONFLUENCE_DOMAIN, 
        CONFLUENCE_EMAIL, 
        CONFLUENCE_API_KEY
      );

      if (!searchResults || searchResults.length === 0) {
        return new Response(JSON.stringify({
          answer: "I couldn't find any relevant articles in the knowledge base about your question. Could you try rephrasing it or asking about a different topic?",
          articles: [],
          confidence: 'low'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Generate simple summary (no AI)
      const summary = generateSimpleSummary(userQuestion, searchResults);

      // Return response with article references
      return new Response(JSON.stringify({
        answer: summary,
        articles: searchResults.map(article => ({
          title: article.title,
          space: article.space?.name || 'Unknown',
          url: `https://${CONFLUENCE_DOMAIN}/wiki${article._links.webui}`,
          excerpt: extractText(article.body?.view?.value || '', 150)
        })),
        confidence: 'high'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300',
        },
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        answer: "I'm having trouble processing your question right now. Please try again in a moment."
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

// Search Confluence with priority on Platform Operations
async function searchConfluence(query, domain, email, apiKey) {
  const authString = btoa(`${email}:${apiKey}`);
  
  // Search all spaces
  const cqlQuery = `text ~ "${query}"`;
  const url = `https://${domain}/wiki/rest/api/content/search?cql=${encodeURIComponent(cqlQuery)}&limit=10&expand=body.view,space`;

  const response = await fetch(url, {
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
  // Prioritize Platform Operations results
  return prioritizePlatformOps(data.results || []);
}

// Prioritize Platform Operations articles
function prioritizePlatformOps(articles) {
  const platformOps = articles.filter(a => a.space?.name === 'Platform Operations');
  const others = articles.filter(a => a.space?.name !== 'Platform Operations');
  return [...platformOps, ...others].slice(0, 5);
}

// Generate simple summary without AI
function generateSimpleSummary(question, articles) {
  const articleCount = articles.length;
  const platformOpsCount = articles.filter(a => a.space?.name === 'Platform Operations').length;
  
  let summary = `I found ${articleCount} article${articleCount > 1 ? 's' : ''} related to "${question}".\n\n`;
  
  if (platformOpsCount > 0) {
    summary += `${platformOpsCount} of these are from the Platform Operations knowledge base.\n\n`;
  }
  
  summary += 'Here\'s what I found:\n\n';
  
  articles.forEach((article, index) => {
    const text = extractText(article.body?.view?.value || '', 200);
    summary += `${index + 1}. **${article.title}** (${article.space?.name})\n${text}\n\n`;
  });
  
  summary += 'Please check the article links below for complete details.';
  
  return summary;
}

// Extract clean text from HTML
function extractText(html, maxLength = 200) {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
}

