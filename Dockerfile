FROM n8nio/n8n:latest

USER root

# 기존 설치 삭제 후 깨끗하게 재설치
RUN apk add --no-cache python3 py3-pip && \
    pip install --upgrade youtube-transcript-api --break-system-packages

USER node