# Cloudflare Worker Setup Guide

## Step 1: Access Cloudflare Dashboard

1. Go to https://dash.cloudflare.com/
2. Log in with your existing Cloudflare account (the one you use for Warp)

## Step 2: Create a Worker

1. In the left sidebar, click **"Workers & Pages"**
2. Click **"Create application"** button
3. Click **"Create Worker"** button
4. Give it a name: `confluence-proxy` (or any name you like)
5. Click **"Deploy"**

## Step 3: Add the Worker Code

1. After deployment, click **"Edit code"** button
2. **Delete all the default code** in the editor
3. **Copy the entire contents** of `cloudflare-worker.js` file
4. **Paste it** into the Cloudflare editor
5. Click **"Save and Deploy"** button (top right)

## Step 4: Get Your Worker URL

After saving, you'll see your worker URL. It will look like:
```
https://confluence-proxy.YOUR-USERNAME.workers.dev
```

**Copy this URL!** You'll need it for the next step.

## Step 5: Update Your Webpage

Come back to this chat and share your Worker URL with me, and I'll update the `index.html` file to use it!

---

## Security Note

The API key is embedded in the worker code. This is secure because:
- The worker code runs on Cloudflare's servers (not in the browser)
- Users can't see the API key
- Only your worker can access it

If you want extra security, you can use Cloudflare's Environment Variables instead (optional, more advanced).

---

## Troubleshooting

If the worker doesn't work:
1. Check that you copied the entire code from `cloudflare-worker.js`
2. Verify you clicked "Save and Deploy"
3. Test the worker by visiting: `https://your-worker-url.workers.dev/?query=test`
4. You should see JSON results from Confluence




