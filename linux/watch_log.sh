#!/bin/bash

WATCH_DIR="/var/log/apache2"
SCRIPT_PATH="/path/to/log_to_mysql.py"
VENV_ACTIVATE="/path/to/python/venv/bin/activate"

inotifywait -m -e create "$WATCH_DIR" --format "%f" | while read filename; do
    if [[ "$filename" =~ ^access\.log\.[0-9]+(\.gz)?$ ]]; then
        echo "[INFO] 新しいログ検出: $filename"
        source "$VENV_ACTIVATE"
        cd "$WATCH_DIR"
        python3 "$SCRIPT_PATH" "$filename" && rm -f "$WATCH_DIR/$filename"
        echo "[INFO] 書き込み・削除完了"
    fi
done