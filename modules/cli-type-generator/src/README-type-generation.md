# Simple Type Generation

Consolidated type generation that replaces scattered scripts with a single mapping file.

## Usage

```bash
# Generate all types
yarn types:generate

# Watch for changes  
yarn types:watch

# Generate specific file
node modules/cli-type-generator/src/cli.js generate modules/types/src/audit-record.type.js
```

## Configuration

Edit `type-mappings.js` at repo root:

```javascript
export const typeMappings = {
  'modules/types/src/audit-record.type.js'  : [ 'modules/curb-map/src/types', 'modules/orchestration/src/types'],
  'modules/curb-map/types/blockface.type.js': ['modules/curb-map/src/types']
}
```

## Adding New Types

1. Add entry to `type-mappings.js` 
2. Run `yarn types:generate` to test
3. Done

That's it. 80 lines of code total.
