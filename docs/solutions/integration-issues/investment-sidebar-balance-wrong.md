---
tags: [investment, sidebar, balance, holdings, cash]
category: integration-issues
module: quicken-web-app
symptoms:
  - Investment account shows $0 in sidebar
  - 401k account shows $0 despite having cash
  - Investment account shows wrong non-zero balance
  - BuyX SellX amounts inflating sidebar
---

# Investment Account Sidebar Balance Wrong

## Solution

When an investment-type account has zero holdings balance, fall back to
`cashBalanceFromRunning` which reads the last transaction's `runningBalance` field.
This DB-computed value respects the `CASH_IMPACT_ACTIONS` set — correctly includes
XIn/ContribX cash deposits while excluding BuyX/SellX non-cash actions.

## Prevention

For investment accounts, always use `runningBalance` (import-computed) rather than
summing raw transaction amounts. The `CASH_IMPACT_ACTIONS` filtering is critical
and only applied during the SQL window function computation.

## Problem

Investment and 401(k)/403(b) accounts show incorrect balances in the account list sidebar.
Two variants:
1. Cash-only accounts show $0
2. Accounts with BuyX/SellX show inflated values

## Investigation

For investment-type accounts, the sidebar uses `sumHoldingsForAccount` which sums
`marketValue` from the holdings computation. Holdings include securities + cash.

Cash holdings are only created for accounts that already have security positions
(`accountIdsWithHoldings` in holdings.js). If no lots exist, `computeHoldingsAsOf`
returns `[]` early.

## Root Cause

Two issues in `EnrichedAccount.fromAccount`:
1. Cash-only investment accounts get zero from holdings (no lots → no cash holding created)
2. Falling back to `sumBankBalance` (sum all amounts) is wrong for investment accounts
   because BuyX/SellX have amounts that don't affect cash (they're not in CASH_IMPACT_ACTIONS)
