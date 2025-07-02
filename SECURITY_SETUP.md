# Security Setup Guide

## 🔐 API Key Security

This guide ensures your NerdAlert project is properly configured with secure API key management.

## ⚠️ Important Security Notes

- **Never commit API keys to version control**
- **Always use environment variables for sensitive data**
- **Rotate API keys regularly**
- **Use different keys for development and production**

## 🛠️ Required API Keys

### 1. **LLM API Key** (Required)
Used for AI model interactions (OpenAI, LocalAI, etc.)

**Get it from:**
- OpenAI: https://platform.openai.com/api-keys
- LocalAI: No key required (use local models)

**Set in:** `server/.env`
```bash
LLM_API_KEY=your_openai_api_key_here
```

### 2. **Serper API Key** (Recommended)
Used for web search functionality

**Get it from:** https://serper.dev/
- Free tier: 100 searches/month
- Paid plans available for higher usage

**Set in:** `server/.env`
```bash
SERPER_API_KEY=your_serper_api_key_here
```

### 3. **Brave API Key** (Optional)
Alternative search provider

**Get it from:** https://api.search.brave.com/
- Free tier available
- Alternative to Serper

**Set in:** `server/.env`
```bash
BRAVE_API_KEY=your_brave_api_key_here
```

## 📁 Environment File Setup

### Server Environment (`server/.env`)

1. **Copy the example file:**
   ```bash
   cp server/env.example server/.env
   ```

2. **Edit the file with your API keys:**
   ```bash
   # Server Configuration
   PORT=80
   NODE_ENV=development
   
   # AI Model Configuration
   LLM_API_KEY=sk-your-actual-openai-key-here
   LLM_BASE_URL=https://api.openai.com/v1
   MODEL=gpt-4
   
   # Web Search Configuration
   SERPER_API_KEY=your-actual-serper-key-here
   BRAVE_API_KEY=your-actual-brave-key-here
   
   # Search Configuration
   SEARCH_PROVIDER=serper
   SEARCH_FALLBACK_ENABLED=true
   ```

### Client Environment (`client/.env`)

1. **Copy the example file:**
   ```bash
   cp client/env.example client/.env
   ```

2. **Edit the file:**
   ```bash
   # API Configuration
   VITE_NERDALERT_API_URL=http://localhost:80
   
   # WalletConnect Configuration (optional)
   VITE_WALLET_PROJECT_ID=your_walletconnect_project_id_here
   VITE_WALLET_ENABLED=false
   ```

## 🔍 Verification Steps

### 1. **Check for Hardcoded Keys**
Run this command to ensure no API keys are hardcoded:
```bash
grep -r "sk-" server/src/ || echo "✅ No hardcoded OpenAI keys found"
grep -r "4d1982fb5c40dbd06aa445d490292575f60a8f91" . || echo "✅ No hardcoded Serper keys found"
```

### 2. **Test API Key Configuration**
```bash
# Test server configuration
cd server
npm run test-search-simple

# Test client configuration
cd client
npm run dev
```

### 3. **Verify Environment Loading**
The server should log configuration on startup:
```bash
cd server
npm run dev
```

## 🚨 Security Checklist

- [ ] API keys are in `.env` files (not in code)
- [ ] `.env` files are in `.gitignore`
- [ ] No API keys in commit history
- [ ] Different keys for dev/prod environments
- [ ] API keys have appropriate permissions
- [ ] Keys are rotated regularly

## 🔧 Troubleshooting

### "API Key Not Found" Errors

1. **Check environment file exists:**
   ```bash
   ls -la server/.env
   ls -la client/.env
   ```

2. **Verify environment loading:**
   ```bash
   # Server
   cd server
   node -e "require('dotenv').config(); console.log('LLM_API_KEY:', process.env.LLM_API_KEY ? 'Set' : 'Not set')"
   
   # Client
   cd client
   node -e "console.log('VITE_NERDALERT_API_URL:', process.env.VITE_NERDALERT_API_URL || 'Not set')"
   ```

3. **Check file permissions:**
   ```bash
   chmod 600 server/.env
   chmod 600 client/.env
   ```

### Search Not Working

1. **Verify search API keys:**
   ```bash
   cd server
   npm run test-search-simple
   ```

2. **Check search provider configuration:**
   ```bash
   # In server/.env
   SEARCH_PROVIDER=serper  # or brave
   SEARCH_FALLBACK_ENABLED=true
   ```

## 🛡️ Production Security

### Environment Variables in Production

**Frontend Deployment:**
- Set environment variables in your deployment platform dashboard
- Use `VITE_` prefix for client-side variables

**Backend Deployment:**
- Use your platform's environment variable system
- Never commit `.env` files to production

### API Key Rotation

1. **Generate new API keys**
2. **Update environment variables**
3. **Test functionality**
4. **Revoke old keys**

## 📞 Support

If you encounter security issues:
1. Check this guide first
2. Verify environment file setup
3. Test with the verification steps above
4. Open an issue on GitHub with details

---

**Remember: Security is everyone's responsibility!** 🔐 