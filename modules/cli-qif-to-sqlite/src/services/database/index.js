import {
    clearAccounts,
    findAccountByName,
    getAccountCount,
    getAllAccounts,
    importAccounts,
    insertAccount,
} from './accounts.js'
import {
    clearCategories,
    findCategoryByName,
    getAllCategories,
    getCategoryCount,
    importCategories,
    insertCategory,
} from './categories.js'
import {
    countDailyPortfolios,
    getAllDailyPortfolios,
    getAllDailyPortfoliosForAccount,
    getCurrentPortfolio,
    getDailyPortfolio,
    getDailyPortfoliosByAccount,
    getDailyPortfoliosByDate,
} from './daily-portfolios.js'
import {
    getAllCurrentHoldings,
    getCurrentHoldings,
    getHoldingByAccountAndSecurity,
    getHoldingsAsOf,
    getHoldingsByAccount,
    getHoldingsBySecurity,
    getHoldingsCount,
} from './holdings.js'
import {
    clearLots,
    getAllLots,
    getLotCount,
    getLotsByAccountAndSecurity,
    getOpenLotsByAccountAndSecurity,
    importLots,
    insertLot,
} from './lots.js'
import { clearPrices, getAllPrices, getPriceCount, importPrices, insertPrice } from './prices.js'
import {
    clearSecurities,
    findSecurityByName,
    findSecurityByNameOrSymbol,
    findSecurityBySymbol,
    getAllSecurities,
    importSecurities,
    insertSecurity,
} from './securities.js'
import { clearTags, findTagByName, getAllTags, getTagCount, importTags, insertTag } from './tags.js'
import {
    clearTransactions,
    getAllTransactions,
    getTransactionCount,
    importBankTransactions,
    importInvestmentTransactions,
    insertBankTransaction,
    insertInvestmentTransaction,
} from './transactions.js'

export {
    // insert (for testing only)
    insertAccount,
    insertBankTransaction,
    insertCategory,
    insertInvestmentTransaction,
    insertLot,
    insertPrice,
    insertSecurity,
    insertTag,

    // import
    importAccounts,
    importBankTransactions,
    importCategories,
    importInvestmentTransactions,
    importLots,
    importPrices,
    importSecurities,
    importTags,

    // clear
    clearAccounts,
    clearCategories,
    clearLots,
    clearPrices,
    clearSecurities,
    clearTags,

    // count
    getTagCount,
    getPriceCount,
    getLotCount,
    getAccountCount,
    getCategoryCount,
    getHoldingsCount,
    countDailyPortfolios,

    // getAll
    clearTransactions,
    getAllAccounts,
    getAllCategories,
    getAllLots,
    getAllPrices,
    getAllSecurities,
    getAllTags,
    getAllTransactions,
    getTransactionCount,

    // find
    findAccountByName,
    findCategoryByName,
    findSecurityByName,
    findSecurityByNameOrSymbol,
    findSecurityBySymbol,
    findTagByName,

    // lots
    getOpenLotsByAccountAndSecurity,
    getLotsByAccountAndSecurity,

    // holdings
    getCurrentHoldings,
    getHoldingsAsOf,
    getHoldingsByAccount,
    getHoldingsBySecurity,
    getHoldingByAccountAndSecurity,

    // daily portfolios (computed view)
    getCurrentPortfolio,
    getDailyPortfolio,
    getDailyPortfoliosByAccount,
    getDailyPortfoliosByDate,
    getAllDailyPortfolios,
    getAllDailyPortfoliosForAccount,

    // analysis
    getAllCurrentHoldings,
}
