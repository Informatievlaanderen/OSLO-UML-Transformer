#!/bin/bash
#
# Compare two json files and print their differences if any

canonize_json() {
    local file="$1"
    local canonized_file="${file%.json}_canonized.json"
    
    # Canonize the JSON file using jq
    jq -S 'del(.["@id"], .generatedAtTime)' "$file" > "$canonized_file"
    
    echo "$canonized_file"
}

json_diff() {
    # Canonize the golden master
    canonized_file1=$(canonize_json "$1")
    
    # Canonize the file to be tested
    canonized_file2=$(canonize_json "$2")
    
    # Compare the canonized JSON files using diff
    diff_result=$(diff -u "$canonized_file1" "$canonized_file2")
    
    # Check if there are any differences
    if [ -n "$diff_result" ]; then
        echo "$diff_result"
    fi
    
    # Clean up the temporary canonized JSON files
    rm "$canonized_file1" "$canonized_file2"
}
