// ABOUTME: Signature functions for stable entity matching across QIF imports
// ABOUTME: Produces deterministic strings to identify entities even when QIF data changes

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Normalize payee string for consistent matching
// @sig toNormalizedPayee :: String -> String
const toNormalizedPayee = payee => (payee || '').toLowerCase().trim().replace(/\s+/g, ' ')

// Generate signature for security matching (symbol preferred, else normalized name)
// @sig buildSecuritySignature :: Security -> String
const buildSecuritySignature = security => security.symbol || toNormalizedPayee(security.name)

// Generate signature for bank transaction matching (uses stable account ID per D2)
// @sig buildBankTransactionSignature :: (Transaction, String) -> String
const buildBankTransactionSignature = ({ date, amount, payee }, stableAccountId) =>
    [stableAccountId, date, amount, toNormalizedPayee(payee)].join('|')

// Generate signature for investment transaction matching (uses stable IDs per D2)
// QIF parser puts action in transactionType; we use that for the signature
// @sig buildInvestmentTransactionSignature :: (Transaction, String, String | undefined) -> String
const buildInvestmentTransactionSignature = (
    { date, transactionType, quantity, amount },
    stableAccountId,
    stableSecurityId,
) => [stableAccountId, date, transactionType, stableSecurityId, quantity, amount].join('|')

// Generate signature for category matching (exact name match per D3)
// @sig buildCategorySignature :: Category -> String
const buildCategorySignature = category => category.name

// Generate signature for tag matching (exact name match per D3)
// @sig buildTagSignature :: Tag -> String
const buildTagSignature = tag => tag.name

// Generate signature for split matching (uses parent transaction and category stable IDs per D20)
// @sig buildSplitSignature :: (Split, String, String) -> String
const buildSplitSignature = (split, transactionStableId, categoryStableId) =>
    [transactionStableId, categoryStableId, split.amount].join('|')

// Generate signature for price matching (security + date per D14)
// @sig buildPriceSignature :: (String, String) -> String
const buildPriceSignature = (securityStableId, date) => [securityStableId, date].join('|')

// Generate signature for lot matching (per D15)
// @sig buildLotSignature :: (String, String, String, String) -> String
const buildLotSignature = (securityStableId, accountStableId, openDate, openTransactionStableId) =>
    [securityStableId, accountStableId, openDate, openTransactionStableId].join('|')

// Generate signature for lot allocation matching
// @sig buildLotAllocationSignature :: (String, String) -> String
const buildLotAllocationSignature = (lotStableId, transactionStableId) => [lotStableId, transactionStableId].join('|')

const Signatures = {
    toNormalizedPayee,
    buildSecuritySignature,
    buildBankTransactionSignature,
    buildInvestmentTransactionSignature,
    buildCategorySignature,
    buildTagSignature,
    buildSplitSignature,
    buildPriceSignature,
    buildLotSignature,
    buildLotAllocationSignature,
}

export { Signatures }
