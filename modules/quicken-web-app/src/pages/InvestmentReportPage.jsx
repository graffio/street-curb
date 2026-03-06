// ABOUTME: Investment positions report — thin wrapper passing position tree metadata to QueryResultPage
// ABOUTME: Displays portfolio positions grouped by account, security, type, or goal

import { QueryResultPage } from './QueryResultPage.jsx'
import { ReportMetadata } from './report-metadata.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Investment positions report with hierarchical tree display
 * @sig InvestmentReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const InvestmentReportPage = ({ viewId, height }) => (
    <QueryResultPage viewId={viewId} metadata={ReportMetadata.POSITION_TREE_METADATA} height={height} />
)

export { InvestmentReportPage }
