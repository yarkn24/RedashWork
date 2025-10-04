# AI Learning Assistant - Powered by Confluence

An interactive learning page that searches your Confluence knowledge base and creates personalized learning content based on user queries.

## 🚀 Features

- **Interactive Learning Interface**: Users can ask any question or topic they want to learn about
- **Confluence Integration**: Automatically searches your Confluence knowledge base for relevant articles
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Real-time Search**: Get instant results from your Confluence workspace
- **Direct Links**: Quick access to full Confluence articles for deeper learning

## 🛠️ Setup Instructions

### 1. Configure Confluence Settings

Before deploying, you need to update the `index.html` file with your Confluence domain:

1. Open `index.html`
2. Find the line: `const CONFLUENCE_DOMAIN = 'your-domain.atlassian.net';`
3. Replace `'your-domain.atlassian.net'` with your actual Confluence domain
   - Example: If your Confluence URL is `https://mycompany.atlassian.net/wiki`, use `'mycompany.atlassian.net'`

### 2. Deploy to GitHub Pages

1. Go to your GitHub repository settings
2. Navigate to **Pages** section
3. Under **Source**, select "GitHub Actions"
4. Push your changes to the `main` branch
5. The GitHub Actions workflow will automatically deploy your site

Your site will be available at: `https://yarkn24.github.io/RedashWork/`

## 🔑 API Key

The Confluence API key is already embedded in the application. For security in production:
- Consider moving the API key to environment variables
- Use a service account with read-only permissions
- Implement rate limiting if needed

## 📖 How to Use

1. Visit your deployed GitHub Pages site
2. Enter any topic you want to learn about in the text field
3. Click "Start Learning" or press Enter
4. Browse through relevant articles from your Confluence knowledge base
5. Click on article links to read full content in Confluence

## 🎨 Customization

You can customize the appearance by editing the CSS in `index.html`:
- Change the gradient colors in the `body` and `button` styles
- Modify fonts, spacing, and animations
- Adjust the color scheme to match your brand

## ⚠️ Important Notes

- Make sure your Confluence API key has appropriate permissions to search content
- The API key should have at least "Read" access to Confluence spaces
- CORS restrictions may apply depending on your Confluence configuration

## 🔧 Troubleshooting

If you encounter issues:
1. Check that your Confluence domain is correctly configured
2. Verify your API key has the necessary permissions
3. Check the browser console for error messages
4. Ensure your Confluence instance allows API access

## 📝 License

MIT License - Feel free to use and modify as needed!
Redash isleri
