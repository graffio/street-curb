// ABOUTME: Category spending report — thin wrapper passing transaction tree metadata to QueryResultPage
// ABOUTME: Aggregates transactions by category with expand/collapse and totals

import { QueryResultPage } from './QueryResultPage.jsx'
import { ReportMetadata } from './report-metadata.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Category spending report with hierarchical tree display
 * @sig CategoryReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const CategoryReportPage = ({ viewId, height }) => (
    <QueryResultPage viewId={viewId} metadata={ReportMetadata.TRANSACTION_TREE_METADATA} height={height} />
)

export { CategoryReportPage }
