// ABOUTME: Signature functions for stable entity matching across QIF imports
// ABOUTME: Produces deterministic strings to identify entities even when QIF data changes

// Normalize payee string for consistent matching
// @sig normalizePayee :: String -> String
const normalizePayee = payee => (payee || '').toLowerCase().trim().replace(/\s+/g, ' ')

// Generate signature for security matching (symbol preferred, else normalized name)
// @sig securitySignature :: Security -> String
const securitySignature = security => security.symbol || normalizePayee(security.name)

// Generate signature for bank transaction matching (uses stable account ID per D2)
// @sig bankTransactionSignature :: (Transaction, String) -> String
const bankTransactionSignature = ({ date, amount, payee }, stableAccountId) =>
    [stableAccountId, date, amount, normalizePayee(payee)].join('|')

// Generate signature for investment transaction matching (uses stable IDs per D2)
// QIF parser puts action in transactionType; we use that for the signature
// @sig investmentTransactionSignature :: (Transaction, String, String | null) -> String
const investmentTransactionSignature = (
    { date, transactionType, quantity, amount },
    stableAccountId,
    stableSecurityId,
) => [stableAccountId, date, transactionType, stableSecurityId, quantity, amount].join('|')

// Generate signature for category matching (exact name match per D3)
// @sig categorySignature :: Category -> String
const categorySignature = category => category.name

// Generate signature for tag matching (exact name match per D3)
// @sig tagSignature :: Tag -> String
const tagSignature = tag => tag.name

// Generate signature for split matching (uses parent transaction and category stable IDs per D20)
// @sig splitSignature :: (Split, String, String) -> String
const splitSignature = (split, transactionStableId, categoryStableId) =>
    [transactionStableId, categoryStableId, split.amount].join('|')

// Generate signature for price matching (security + date per D14)
// @sig priceSignature :: (String, String) -> String
const priceSignature = (securityStableId, date) => [securityStableId, date].join('|')

// Generate signature for lot matching (per D15)
// @sig lotSignature :: (String, String, String, String) -> String
const lotSignature = (securityStableId, accountStableId, openDate, openTransactionStableId) =>
    [securityStableId, accountStableId, openDate, openTransactionStableId].join('|')

// Generate signature for lot allocation matching
// @sig lotAllocationSignature :: (String, String) -> String
const lotAllocationSignature = (lotStableId, transactionStableId) => [lotStableId, transactionStableId].join('|')

const Signatures = {
    normalizePayee,
    securitySignature,
    bankTransactionSignature,
    investmentTransactionSignature,
    categorySignature,
    tagSignature,
    splitSignature,
    priceSignature,
    lotSignature,
    lotAllocationSignature,
}

export { Signatures }
