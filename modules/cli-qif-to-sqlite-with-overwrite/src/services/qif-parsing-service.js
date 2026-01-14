import { readFileSync } from 'fs'
import parseQifData from '../qif/parse-qif-data.js'

/*
 * Parse a QIF file and return structured data
 * @sig parseQifFile :: String -> QifData
 *  QifData = {accounts: [Account], categories: [Category], securities: [Security], bankTransactions: [Transaction], investmentTransactions: [Transaction], prices: [Price], tags: [Tag], others: [Other]}
 */
const parseQifFile = filePath => {
    let qifContent

    try {
        qifContent = readFileSync(filePath, 'utf8')
    } catch (fileError) {
        throw new Error(`Error reading QIF file: ${fileError.message}`)
    }

    try {
        return parseQifData(qifContent)
    } catch (parseError) {
        throw new Error(`Error parsing QIF file: ${parseError.message}`)
    }
}

export default parseQifFile
