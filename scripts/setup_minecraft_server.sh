#!/bin/bash

SERVER_NAME=$1
MEMORY=${2:-"4G"}
VERSION=${3:-"1.21.9"}
PORT=${4:-"25565"}
TYPE=${5:-"PAPER"}

if [ -z "$SERVER_NAME" ]; then
    echo "Error: No server name provided."
    echo "Usage: ./setup_mc.sh <server_name> [memory] [version] [port]"
    exit 1
fi

BASE_DIR="$HOME/servers/$SERVER_NAME"
DATA_DIR="$BASE_DIR/data"

if [ -d "$BASE_DIR" ]; then
    echo "Error: A server named '$SERVER_NAME' already exists at $BASE_DIR."
    exit 1
fi

mkdir -p "$DATA_DIR"
sudo chown -R $USER:$USER "$BASE_DIR"

cat <<EOF > "$BASE_DIR/docker-compose.yml"
version: "3.9"
services:
  $SERVER_NAME:
    container_name: $SERVER_NAME
    image: itzg/minecraft-server
    ports:
      - "$PORT:25565"
    environment:
      EULA: "TRUE"
      TYPE: "$TYPE"
      VERSION: "$VERSION"
      MEMORY: "$MEMORY"
    volumes:
      - ./data:/data
    restart: unless-stopped
EOF

cd "$BASE_DIR"
docker compose up -d || { echo "Failed to start Docker container"; exit 1; }

echo "Successfully created and started $SERVER_NAME on port $PORT"