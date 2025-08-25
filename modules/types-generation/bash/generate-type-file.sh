#!/bin/zsh

# Get the input file path from the first argument
input_file="$1"

# Determine output directory based on input file location
if [[ "$input_file" == ./test/types/* ]] || [[ "$input_file" == test/types/* ]]; then
    output_directory="test/generated"
elif [[ "$input_file" == ./src/types/* ]] || [[ "$input_file" == src/types/* ]]; then
    output_directory="src/generated"
else
    echo "Error: Unknown input file location: $input_file"
    exit 1
fi

# Convert PascalCase to kebab-case for filename
type_name=$(basename "$input_file" .type.js)
kebab_name=$(echo "$type_name" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]')

# Generate the output file path
output_file="$output_directory/${kebab_name}.js"

# Call the Node.js script with the input and output paths
node src/generate-type-file.js "$input_file" "$output_file"
