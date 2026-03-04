// ABOUTME: View type definition for tab content types
// ABOUTME: Tagged sum with Register, Report, and Reconciliation variants

import { FieldTypes } from './field-types.js'

// prettier-ignore
export const View = {
    name: 'View',
    kind: 'taggedSum',
    variants: {
        Register:       { id: FieldTypes.viewId, accountId: 'String', title: 'String' },
        Report:         { id: FieldTypes.viewId, reportType: 'String', title: 'String' },
        Reconciliation: { id: FieldTypes.viewId, accountId: 'String', title: 'String' },
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
View.CATEGORY_DIMENSION_LAYOUTS = {
    category: { title: 'Spending by Category',  subtitle: 'View spending breakdown by category hierarchy' },
    account : { title: 'Spending by Account',   subtitle: 'View spending breakdown by account' },
    payee   : { title: 'Spending by Payee',     subtitle: 'View spending breakdown by payee' },
    month   : { title: 'Spending by Month',     subtitle: 'View spending breakdown by month' },
}

// prettier-ignore
View.POSITIONS_DIMENSION_LAYOUTS = {
    account     : { title: 'Positions by Account',  subtitle: 'View portfolio positions by account' },
    security    : { title: 'Positions by Security',  subtitle: 'View portfolio positions by security' },
    securityType: { title: 'Positions by Type',      subtitle: 'View portfolio positions by security type' },
    goal        : { title: 'Positions by Goal',      subtitle: 'View portfolio positions by investment goal' },
}

View.DEFAULT_PAGE_TITLE = { title: 'Dashboard', subtitle: '' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Derives page title for a Report view from its reportType and groupBy dimension
// @sig toReportTitle :: (String, String) -> { title: String, subtitle: String }
View.toReportTitle = (reportType, groupBy) => {
    if (reportType === 'positions')
        return View.POSITIONS_DIMENSION_LAYOUTS[groupBy || 'account'] || View.POSITIONS_DIMENSION_LAYOUTS.account
    return View.CATEGORY_DIMENSION_LAYOUTS[groupBy || 'category'] || View.CATEGORY_DIMENSION_LAYOUTS.category
}
