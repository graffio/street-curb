Firestore Rules from a DSL (env + namespaces)

Goal: One DSL defines roles, policies, schemas, and per-verb access. Generator emits Firestore rules that mirror
collections under tests/{ns} only in selected envs (e.g., dev).

# firestore.dsl.yaml
```
envs: [dev, test, staging, prod]
namespace: tests/{ns}
mirrors:
  enabled_in: [dev]        # only dev gets /tests/{ns}/...
roles:
  admin: request.auth != null && request.auth.token.role == "admin"
  self(id): request.auth != null && request.auth.uid == id
policies:
  readSelf(id): roles.self(id) || roles.admin
  writeSelf(id): roles.self(id) || roles.admin
types:
  User:
    name: string
    projects: list<string>
collections:
  users(id: string is User):
    get: policies.readSelf(id)
    list: roles.admin
    create: roles.admin
    update: policies.writeSelf(id)
    delete: roles.admin
  projects(id: string):
    get: request.auth != null
    list: request.auth != null
    create: roles.admin
    update: roles.admin
    delete: roles.admin
```

# generate-rules.js
```javascript
import yaml from 'js-yaml'
import fs from 'node:fs'

const dsl = yaml.load(fs.readFileSync('firestore.dsl.yaml', 'utf8'))
const ENV = process.env.ENV || 'dev'
const mirrorOn = (dsl.mirrors?.enabled_in || []).includes(ENV)
const NS = mirrorOn ? dsl.namespace : null

// ---- helpers to emit rule code ----
const indent = (s, n = 2) =>
    s
        .split('\n')
        .map(l => ' '.repeat(n) + l)
        .join('\n')
const esc = s => s.replaceAll(/\\/g, '\\\\').replaceAll(/`/g, '\\`')

// build role and policy functions
const roleFns = Object.entries(dsl.roles || {})
    .map(([name, expr]) => {
        const params = (name.match(/\(([^)]*)\)/)?.[1] || '').trim()
        const fn = name.replace(/\(.*/, '')
        return `function role_${fn}(${params}) { return ${expr}; }`
    })
    .join('\n')

const polFns = Object.entries(dsl.policies || {})
    .map(([name, expr]) => {
        const params = (name.match(/\(([^)]*)\)/)?.[1] || '').trim()
        const fn = name.replace(/\(.*/, '')
        const exprX = expr.replaceAll('roles.', 'role_').replaceAll('policies.', 'pol_')
        return `function pol_${fn}(${params}) { return ${exprX}; }`
    })
    .join('\n')

// simple schema validators (field presence + coarse types)
const typeMap = dsl.types || {}
const typeFns = Object.entries(typeMap)
    .map(([tName, fields]) => {
        const checks = []
        const keys = Object.keys(fields)
        if (keys.length) {
            checks.push(`d.keys().hasAll([${keys.map(k => `'${k}'`).join(', ')}])`)
        }
        for (const [f, t] of Object.entries(fields)) {
            if (t === 'string') checks.push(`d.${f} is string`)
            else if (t.startsWith('list<string>')) checks.push(`d.${f} is list`)
            else if (t === 'bool') checks.push(`d.${f} is bool`)
            else if (t === 'number') checks.push(`d.${f} is int || d.${f} is float`)
            else checks.push(`d.${f} != null`) // fallback
        }
        return `function is_${tName}(d) { return ${checks.join(' && ')}; }`
    })
    .join('\n')

// utility to expand policy/role names inside collection verb expressions
const rewriteExpr = expr => expr.replaceAll('roles.', 'role_').replaceAll('policies.', 'pol_')

// optional per-create/update schema check: if collection declares "is Type"
const schemaCheck = (colDecl, verb, pathVar = 'request.resource.data') => {
    const m = colDecl.match(/is\s+([A-Za-z0-9_]+)/)
    if (!m) return 'true'
    const t = m[1]
    if (verb === 'create' || verb === 'update') return `is_${t}(${pathVar})`
    return 'true'
}

// emit match blocks for a collection at a given base (root or namespaced)
const emitCol = (base, name, decl, rules) => {
    const idParam = (decl.match(/\(([^)]*)\)/)?.[1] || 'id').split(':')[0].trim() || 'id'
    const path = base ? `${base}/${name}` : name
    const get = rules.get ? rewriteExpr(rules.get) : null
    const list = rules.list ? rewriteExpr(rules.list) : null
    const create = rules.create ? rewriteExpr(rules.create) : null
    const update = rules.update ? rewriteExpr(rules.update) : null
    const del = rules.delete ? rewriteExpr(rules.delete) : null

    const lines = []
    lines.push(`match /${path}/{${idParam}} {`)
    if (get) lines.push(`  allow get: if ${get};`)
    if (list) lines.push(`  allow list: if ${list};`)
    if (create) lines.push(`  allow create: if (${create}) && (${schemaCheck(decl, 'create')});`)
    if (update) lines.push(`  allow update: if (${update}) && (${schemaCheck(decl, 'update')});`)
    if (del) lines.push(`  allow delete: if ${del};`)
    // default deny for unspecified verbs
    lines.push(`}`)
    return lines.join('\n')
}

// root collections
const rootBlocks = Object.entries(dsl.collections || {})
    .map(([name, conf]) => {
        const decl = Object.keys(conf)[0]?.includes(':') ? Object.keys(conf)[0] : 'id: string'
        const rules = Object.fromEntries(
            Object.entries(conf).filter(([k]) => ['get', 'list', 'create', 'update', 'delete'].includes(k)),
        )
        return emitCol('', name, decl, rules)
    })
    .join('\n\n')

// mirrored collections (tests/{ns}/...)
const mirrorBlocks = NS
    ? Object.entries(dsl.collections || {})
          .map(([name, conf]) => {
              const decl = Object.keys(conf)[0]?.includes(':') ? Object.keys(conf)[0] : 'id: string'
              const rules = Object.fromEntries(
                  Object.entries(conf).filter(([k]) => ['get', 'list', 'create', 'update', 'delete'].includes(k)),
              )
              return emitCol(NS, name, decl, rules)
          })
          .join('\n\n')
    : ''

// build final rules file
const prelude = `
${roleFns}
${polFns}
${typeFns}
`.trim()

const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
${indent(prelude, 4)}

${indent(rootBlocks, 4)}

${mirrorBlocks ? '\n' + indent(mirrorBlocks, 4) + '\n' : ''}

    match /{document=**} { allow read, write: if false; }
  }
}
`.trim()

fs.writeFileSync('firestore.rules', rules)
console.log('Wrote firestore.rules for ENV=' + ENV + (NS ? ` (with mirror: /${NS})` : ' (no mirror)'))
```


# Usage

```bash
npm i -D js-yaml
# Dev: includes /tests/{ns}/... mirrors
ENV=dev node generate-rules.mjs && firebase deploy --only firestore

# Staging/Prod: no mirrors
ENV=staging node generate-rules.mjs && firebase deploy --only firestore
ENV=prod    node generate-rules.mjs && firebase deploy --only firestore
```

## Notes

* Admin SDK bypasses rules (safe for seeding).
* Gate emulator auth with token.role="admin" as needed.
