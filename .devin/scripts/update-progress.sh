#!/bin/bash

# Progress update script for PostToolUse hook
# Tracks file changes related to feature development

set -e

# Get the tool input from stdin
input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')
file_path=$(echo "$input" | jq -r '.tool_input.file_path // "unknown"')

# Only track if it's a file operation
if [ "$tool_name" = "edit" ] || [ "$tool_name" = "write" ]; then
    # Extract feature name from path if it's in src/app/
    if [[ "$file_path" =~ src/app/([^/]+)/ ]]; then
        feature_name="${BASH_REMATCH[1]}"
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')

        echo "[$timestamp] Updated $file_path for feature: $feature_name" >> ".devin/feature-progress.log"
    fi
fi

# Always approve (this is just for logging)
echo '{"decision": "approve"}'
