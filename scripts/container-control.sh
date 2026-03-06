#!/bin/bash

CONTAINER_NAME=$1
ACTION=$2

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
SERVER_PATH="$BASE_DIR/servers/$CONTAINER_NAME"

if [ -z "$CONTAINER_NAME" ] || [ -z "$ACTION" ]; then
  echo "Usage: ./container-control.sh <container-name> <action>"
  exit 1
fi

if [ ! -d "$SERVER_PATH" ]; then
  echo "Error: Directory $SERVER_PATH does not exist."
  exit 1
fi

cd "$SERVER_PATH" || exit 1

case $ACTION in
  create)
    docker compose create --pull never
    ;;
  start)
    docker compose up -d
    ;;
  stop)
    docker compose stop -t 30
    ;;
  restart)
    docker compose restart -t 30
    ;;
  down)
    docker compose down -t 30
    ;;
  delete)
    echo "Removing container for $CONTAINER_NAME..."
    docker compose down
    docker rm -f "$CONTAINER_NAME" 2>/dev/null
    ;;
  *)
    echo "Invalid action: $ACTION"
    exit 1
    ;;
esac