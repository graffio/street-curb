// ABOUTME: CLI script to generate a comprehensive QIF test file
// ABOUTME: Writes mock financial data to test-data/comprehensive.qif

import { writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { MockDataGenerator } from '../../cli-qif-to-sqlite/src/mock-data-generator.js'

const { generateMockData, serializeToQif } = MockDataGenerator

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(__dirname, '../test/test-data/comprehensive.qif')

const data = generateMockData()
const qifString = serializeToQif(data)

writeFileSync(outputPath, qifString)

const { accounts, categories, securities, bankTransactions, investmentTransactions, prices } = data
console.log(`Generated ${outputPath}`)
console.log(`  ${accounts.length} accounts`)
console.log(`  ${categories.length} categories`)
console.log(`  ${securities.length} securities`)
console.log(`  ${bankTransactions.length} bank transactions`)
console.log(`  ${investmentTransactions.length} investment transactions`)
console.log(`  ${prices.length} prices`)
