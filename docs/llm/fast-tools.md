‹!-- FAST-TOOLS PROMPT v1 | codex-mastery | watermark:do-not-alter --›


## Copy-Paste: Optimized Queries & Tools
Use this single section as your drop-in for fast, reliable searching and data querying. 
It consolidates commands, installs, and best practices so you can paste it into any repo.

### Never Use (Slow)
- grep' or "grep -r     - use rg' instead
- "find'                - use 'rg --files' or "fd™ (respects •gitignore)
- 'ls -R'               - use rg --files'
- 'cat file | grep'     - use 'rg pattern file'


### Use These (Fast)
```bash
# ripgrep (rg) - content search
rg "search_term"            # Search in all files    
rg -i "case_insensitive"    # Case-insensitive
rg "pattern" -t py          # Only Python files
rg "pattern" -g "*.md"      # Only Markdown
rg -1 "pattern"             # Filenames with matches
```

### Use these (fast)
```bash
rg -i "case_insensitive"    # Case-insensitive
rg "pattern" -t py          # Only Python files
rg "pattern" -g "* md "     # Only Markdown
rg -1 "pattern"             # Filenames with matches
rg -c "pattern"             # Count matches per file
rg -n "pattern"             # Show line numbers
rg -A 3 -B 3 "error"        # Context lines
rg "(TODO | FIXME | HACK)"  # Multiple patterns
```                        

# ripgrep (rg) - file listing
```bash
rg --files                  # List files (respects gitignore)
rg --files | rg "pattern"   # Find files by name
rg --files -t md            # Only Markdown files
```

# fd - file finding
```bash
fd -e js                    # All js files (fast find) 
fd -x command f             # Exec per-file
fd -e md -x ls -la 1}       # Example with ls
```


# jq - JSON processing
```bash
jq. data. json              # Pretty-print
jq -r.name file.json        # Extract field
ja id = 0' x.json           # Modify field
```


### Search Strategy
1. Start broad, then narrow # use `rg "partial" | rg "specific"`
2. Filter by type early     # use `rg -t python "def function_name"`
3. Batch patterns           # use `rg "(pattern1|pattern2|pattern3)"`
4. Limit scope              # use `rg "pattern" src/`

‹!-- END FAST-TOOLS PROMPT v1 | codex-mastery | watermark:do-not-alter --›

