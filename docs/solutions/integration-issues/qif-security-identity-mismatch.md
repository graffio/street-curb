---
tags: [qif, import, prices, securities, unique-constraint]
category: integration-issues
module: cli-qif-to-sqlite
symptoms:
  - UNIQUE constraint failed prices.securityId prices.date
  - Price import crashes on first import
  - Different symbol strings for same security
---

# QIF Security Identity Mismatch

## Problem

Importing QIF files with both `!Type:Prices` and investment transactions crashes with
`UNIQUE constraint failed: prices.securityId, prices.date`.

## Investigation

QIF `!Type:Prices` entries use the security **name** (e.g., "Apple Inc") as the symbol field.
Investment transactions use the **ticker** (e.g., "AAPL"). The parser stores both as `symbol`.

The `securityMap` correctly resolves both to the same `securityId` (it indexes by name AND symbol).
But client-side dedup uses raw `symbol` strings, so `"Apple Inc|2024-01-15"` and
`"AAPL|2024-01-15"` appear as different entries.

## Root Cause

Two-layer identity: QIF data identifies securities by string (name or ticker), but the DB
identifies by `securityId`. Dedup at the string layer can't catch collisions that only appear
at the DB layer.

## Solution

DB-level safety net in `importSinglePrice`: before INSERT, query for existing
`(securityId, date)` row. If found, UPDATE instead of INSERT. This catches all cases
where different symbol strings resolve to the same security.

Client-side dedup (`T.toMergedPrices`) still handles the common case. The DB check
is a fallback for edge cases.

## Prevention

When deduplicating data that will be resolved to DB identities, add a DB-level check
as a safety net. String-level dedup is an optimization, not a guarantee.
