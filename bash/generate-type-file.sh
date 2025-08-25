#!/bin/zsh
# Usage: generate-type-file.sh <input-file-path> <output-directory-path>

input_file="$1"
output_dir="$2"

# Extract filename (already in kebab-case) and change extension
base_name=$(basename "$input_file" .type.js)
output_file="$output_dir/${base_name}.js"

# build-tools directory relative to the location of the caller (in module x at .../quicken-tools/modules/x)
BUILD_TOOLS_DIR="../../modules/build-tools"

# Call the Node.js generator
node "$BUILD_TOOLS_DIR/src/generate-type-file.js" "$input_file" "$output_file"
