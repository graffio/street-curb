#!/bin/zsh
# Usage: generate-type-file.sh <input-file-path> <output-directory-path>

input_file="$1"
output_dir="$2"

# Extract filename (already in kebab-case) and change extension
base_name=$(basename "$input_file" .type.js)
output_file="$output_dir/${base_name}.js"

# types-generation directory - handle both relative and absolute calls
SCRIPT_DIR="$(dirname "$0")"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TYPES_GEN_DIR="$REPO_ROOT/modules/types-generation"

# Call the Node.js generator
node "$TYPES_GEN_DIR/src/generate-type-file.js" "$input_file" "$output_file"
