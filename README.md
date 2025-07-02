# NerdAlert - AI Pop-Culture Agent

A comprehensive AI agent platform for pop-culture enthusiasts featuring a specialized AI agent with energy matching, conversation memory, enhanced date accuracy verification, RAG capabilities, and a modern React frontend.

## 🚀 Project Overview

NerdAlert is a full-stack AI agent development platform that includes:

- **AI Agent Backend**: Specialized pop-culture AI with web search, conversation memory, and adaptive personality
- **React Frontend**: Modern chat interface with cyberpunk theme and real-time streaming
- **Advanced Features**: Energy matching, conversation memory, dynamic prompt engineering, and RAG integration
- **LocalAI Support**: Local model deployment and management capabilities

## 📁 Project Structure

```
NerdAlert/
├── server/                 # AI Agent Backend (Express + TypeScript)
│   ├── src/               # Source code
│   │   ├── index.ts       # Main server entry point
│   │   ├── prompt/        # AI prompt handling and tools
│   │   ├── rag/           # RAG (Retrieval-Augmented Generation)
│   │   └── search-service.ts # Web search integration
│   ├── test-*.js          # Test scripts for various features
│   └── package.json       # Backend dependencies
├── client/                # React Frontend (Vite + TypeScript)
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and API client
│   │   └── pages/         # Page components
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── package.json           # Root package.json (workspace configuration)
└── README.md              # This file
```

## 🎯 Key Features

### AI Agent Backend
- **Pop-Culture Expertise**: Deep knowledge of movies, TV, comics, tech, and geek culture
- **Real-Time Information**: Google Custom Search integration for up-to-date facts and news
- **Energy Matching**: Dynamically adapts to user's enthusiasm and emotional tone
- **Conversation Memory**: Maintains context across conversations
- **Enhanced Accuracy**: Comprehensive date validation and fact verification
- **RAG Integration**: Retrieval-Augmented Generation for improved responses

### React Frontend
- **Modern UI**: Cyberpunk-themed chat interface with real-time streaming
- **Responsive Design**: Works on desktop and mobile devices
- **Real-Time Chat**: Streaming responses with thinking indicators
- **Wallet Integration**: Optional Ethereum wallet connectivity
- **Sidebar Management**: Chat history and new chat functionality

## 🔐 Security First

**⚠️ Important**: This project requires API keys for full functionality. All sensitive data is managed through environment variables.

### Required API Keys:
- **LLM API Key**: For AI model interactions (OpenAI, LocalAI, etc.)
- **Google API Key + CSE ID**: For Google Custom Search (REQUIRED)

### Quick Security Setup:
```bash
# Copy environment templates
cp server/env.example server/.env
cp client/env.example client/.env

# Edit with your API keys
# See SECURITY_SETUP.md for detailed instructions
```

📖 **For detailed security setup, see [SECURITY_SETUP.md](SECURITY_SETUP.md)**

## 🛠️ Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- Google Custom Search API setup

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/yourusername/nerdalert.git
   cd nerdalert
   npm run install:all
   ```

2. **Set up environment variables**:
   ```bash
   # Copy example environment files
   cp client/env.example client/.env
   cp server/env.example server/.env
   
   # Edit the files with your API keys
   # - VITE_NERDALERT_API_URL (for frontend)
   # - GOOGLE_API_KEY + GOOGLE_CSE_ID (for Google search)
   # - LLM_API_KEY (for AI model)
   ```

3. **Start the development servers**:
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start individually
   npm run dev:agent    # Backend on http://localhost:80
   npm run dev:frontend # Frontend on http://localhost:5050
   ```

## 🎮 Usage

### Development Mode
- **Backend**: Runs on `http://localhost:80`
- **Frontend**: Runs on `http://localhost:5050`
- **API Endpoint**: `POST /prompt` for chat interactions

### Production Build
```bash
# Build both applications
npm run build

# Start production server
npm start
```

## 🧪 Testing

```bash
# Test Google search configuration
cd server
node test-google-only.js

# Run all tests
npm test

# Run specific test suites
npm run test:agent      # Backend tests
npm run test:frontend   # Frontend tests

# Run specific feature tests
npm run test-accuracy   # Accuracy improvements
npm run test-cast-accuracy # Cast information accuracy
npm run test-date-accuracy # Date validation
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**:
```bash
VITE_NERDALERT_API_URL=http://localhost:80
VITE_WALLET_ENABLED=false
```

**Backend (.env)**:
```bash
PORT=80
LLM_API_KEY=your_llm_api_key
LLM_BASE_URL=your_llm_base_url
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_google_cse_id
MODEL=your_model_name
```

### Google Custom Search Setup

1. **Get Google API Key**: Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. **Create Custom Search Engine**: Visit [Programmable Search Engine](https://programmablesearchengine.google.com/)
3. **Configure for entertainment**: Set up search engine to include entertainment sites
4. **Add to environment**: Set `GOOGLE_API_KEY` and `GOOGLE_CSE_ID` in your `.env` file

### Customizing the Agent
Edit `server/src/system-prompt.txt` to customize:
- Personality traits
- Energy matching behavior
- Communication style
- Special interests and knowledge areas

## 📊 Performance

- **Response Time**: < 2 seconds for most queries
- **Memory Usage**: Optimized for local deployment
- **Scalability**: Designed for single-user to small-group usage
- **Reliability**: Robust error handling and recovery
- **Accuracy**: Google Custom Search provides high-quality, current information

## 🚀 Deployment

### Frontend Deployment
1. Connect your GitHub repository to your preferred platform
2. Set root directory to `client`
3. Configure environment variables
4. Deploy automatically on push

### Backend Deployment
- **LocalAI**: For privacy-focused local deployment
- **Traditional VPS**: For full control
- **Railway/Render/Fly.io**: For cloud deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LocalAI** for local model deployment capabilities
- **Google Custom Search API** for high-quality web search functionality
- **OpenAI** for API integration patterns
- **The AI/ML community** for inspiration and best practices

## 📞 Support

For support, questions, or feature requests:
- Open an issue on GitHub
- Check the documentation in the respective directories
- Review the troubleshooting guides

---

**Made with ❤️ for the geek community** 