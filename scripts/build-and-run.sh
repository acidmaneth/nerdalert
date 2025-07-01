LLM_MODEL_ID=
LLM_BASE_URL=
LLM_API_KEY=

SERPER_API_KEY=
BRAVE_API_KEY=

docker build -t nerdalert . --pull
docker run -p 8080:8080 \
    -e LLM_BASE_URL="$LLM_BASE_URL" \
    -e LLM_API_KEY="$LLM_API_KEY" \
    -e MODEL="$MODEL" \
    -e BRAVE_API_KEY="$BRAVE_API_KEY" \
    -e SERPER_API_KEY="$SERPER_API_KEY" \
    nerdalert
