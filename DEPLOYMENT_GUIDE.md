# NerdAlert Deployment Guide

This guide provides instructions for deploying your NerdAlert agent to various cloud platforms.

## 🚀 Deployment Options

### Option 1: Railway (Recommended for Beginners)

**Railway** offers easy deployment with automatic scaling and a generous free tier.

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect your GitHub repository**
3. **Create a new project** and select your NerdAlert repository
4. **Set environment variables**:
   ```bash
   PORT=80
   LLM_API_KEY=your_openai_api_key
   GOOGLE_API_KEY=your_google_api_key
   GOOGLE_CSE_ID=your_google_cse_id
   SERPER_API_KEY=your_serper_api_key
   NODE_ENV=production
   ```
5. **Deploy** - Railway will automatically build and deploy your agent
6. **Get your deployment URL** (e.g., `https://your-app.railway.app`)

### Option 2: Render

**Render** provides a free tier and easy deployment process.

1. **Sign up** at [render.com](https://render.com)
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. **Set environment variables** (same as Railway)
6. **Deploy** and get your URL

### Option 3: Fly.io

**Fly.io** offers global edge deployment with a generous free tier.

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`
2. **Sign up** at [fly.io](https://fly.io)
3. **Login**: `fly auth login`
4. **Launch your app**: `fly launch`
5. **Set secrets**:
   ```bash
   fly secrets set LLM_API_KEY=your_key
   fly secrets set GOOGLE_API_KEY=your_key
   fly secrets set GOOGLE_CSE_ID=your_id
   fly secrets set SERPER_API_KEY=your_key
   ```
6. **Deploy**: `fly deploy`

### Option 4: Traditional VPS

For full control over your deployment:

1. **Choose a VPS provider** (DigitalOcean, Linode, Vultr, etc.)
2. **Set up your server** with Node.js and PM2
3. **Clone your repository**
4. **Install dependencies**: `npm install`
5. **Set up environment variables**
6. **Build the project**: `npm run build`
7. **Start with PM2**: `pm2 start dist/index.js --name nerdalert`

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Server Configuration
PORT=80
NODE_ENV=production

# AI Model Configuration
LLM_API_KEY=your_openai_api_key_here
LLM_BASE_URL=https://api.openai.com/v1
MODEL=gpt-4

# Search Configuration
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ID=your_custom_search_engine_id_here
SERPER_API_KEY=your_serper_api_key_here

# Search Settings
SEARCH_PROVIDER=google
SEARCH_FALLBACK_ENABLED=true
```

### Optional Environment Variables

```bash
# Brave Search (alternative)
BRAVE_API_KEY=your_brave_api_key_here

# Custom system prompt
SYSTEM_PROMPT=path/to/custom/system-prompt.txt

# LocalAI Configuration
LOCALAI_BASE_URL=http://localhost:8080
LOCALAI_MODEL=your_local_model_name
```

## 🌐 Frontend Configuration

Once your agent is deployed, update your frontend environment variables:

### For Frontend Deployment

In your deployment platform dashboard, set these environment variables:

```bash
VITE_NERDALERT_API_URL=https://your-deployed-agent.com
VITE_WALLET_ENABLED=false
VITE_WALLET_PROJECT_ID=your_walletconnect_project_id
VITE_APP_TITLE=NerdAlert Chat
VITE_APP_DESCRIPTION=Cyberpunk AI Chat Interface
VITE_API_BASE_URL=https://your-deployed-agent.com
VITE_SHOW_WALLET=false
```

### For Local Development

Create a `.env` file in your `client` directory:

```bash
VITE_NERDALERT_API_URL=http://localhost:80
VITE_WALLET_ENABLED=false
VITE_WALLET_PROJECT_ID=your_walletconnect_project_id
```

## 🔍 Testing Your Deployment

1. **Health Check**: Visit `https://your-deployed-agent.com/health`
2. **API Test**: Send a POST request to `https://your-deployed-agent.com/prompt`
3. **Frontend Test**: Deploy your frontend and test the full chat interface

### Example API Test

```bash
curl -X POST https://your-deployed-agent.com/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello! What can you tell me about Marvel movies?"}
    ]
  }'
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit API keys to version control
2. **CORS Configuration**: Ensure your agent allows requests from your frontend domain
3. **Rate Limiting**: Consider implementing rate limiting for production use
4. **SSL**: Ensure HTTPS is enabled for all production deployments
5. **API Key Rotation**: Regularly rotate your API keys

## 📊 Monitoring and Maintenance

### Health Monitoring

- Set up health checks for your deployment
- Monitor response times and error rates
- Set up alerts for downtime

### Logs and Debugging

- Check application logs regularly
- Monitor API usage and costs
- Set up error tracking (e.g., Sentry)

### Updates and Maintenance

- Keep dependencies updated
- Monitor for security vulnerabilities
- Plan for regular maintenance windows

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version compatibility
2. **Environment Variables**: Ensure all required variables are set
3. **CORS Errors**: Verify CORS configuration allows your frontend domain
4. **API Timeouts**: Check network connectivity and API limits
5. **Memory Issues**: Monitor memory usage and optimize if needed

### Getting Help

- Check the platform-specific documentation
- Review application logs for error messages
- Test locally to isolate issues
- Open an issue in the repository with detailed information

---

**Your NerdAlert agent is now ready for production deployment!** 🚀

Choose the deployment option that best fits your needs and budget. All platforms mentioned above offer free tiers to get you started. 