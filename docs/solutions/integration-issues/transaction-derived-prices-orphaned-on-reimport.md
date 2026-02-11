---
tags: [qif, import, prices, transactions, orphaning, reimport, architecture]
category: integration-issues
module: cli-qif-to-sqlite
symptoms:
  - Prices from investment transactions disappear on reimport
  - Import summary shows hundreds of orphaned prices
  - Transaction-derived prices wiped out by second import
---

# Transaction-Derived Prices Orphaned on Reimport

## Problem

Importing an older QIF file creates price entries from investment transactions (Buy, Sell, etc.).
Reimporting a newer QIF file orphans all those prices. The import summary shows hundreds of
orphaned prices that should have survived.

## Investigation

The original implementation had a separate `importTransactionDerivedPrices` pass that ran
AFTER `importPrices`. It used direct DB queries to upsert prices by (securityId, date),
bypassing the `priceLookup` map.

The orphaning system works by: `buildLookupMaps` loads all existing entities into lookup maps →
import steps consume entries from those maps → `markOrphanedEntities` orphans anything unconsumed.

Transaction-derived prices appeared in `priceLookup` (they're Price entities) but were never
consumed from it — the separate import pass used its own DB queries. So every transaction-derived
price was left unconsumed and orphaned.

## Root Cause

Two separate code paths for the same entity type (prices) with only one participating in the
consumption-based orphaning protocol.

## Solution

Eliminated the separate import pass entirely. Transaction prices are now extracted in the CLI
transform layer (`T.toTransactionPrices` in cli.js) and merged into the prices array via
`T.toMergedPrices` before import. Transaction prices win when duplicating a QIF `!Type:Prices`
entry for the same symbol+date (last-wins dedup).

All prices now flow through the single `importPrices` code path, which correctly consumes
from `priceLookup`. No special handling needed for orphaning.

## Prevention

When adding a new source of data for an existing entity type, feed it through the existing
import path rather than creating a parallel one. The orphaning protocol requires every entity
to be consumed from lookup maps — parallel paths bypass this by design.

General principle: if two things end up in the same DB table, they should go through the
same import pipeline.
