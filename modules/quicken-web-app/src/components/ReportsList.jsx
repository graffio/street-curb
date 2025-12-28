// ABOUTME: Sidebar reports list that opens report tabs on click
// ABOUTME: Dispatches OpenView actions for report views

import { Box, Button, Flex, Heading, Text } from '@graffio/design-system'
import React from 'react'
import { post } from '../commands/post.js'
import { Action } from '../types/action.js'
import { View } from '../types/view.js'

// Available reports
const reports = [
    { id: 'spending', type: 'spending', name: 'Spending by Category' },
    { id: 'holdings', type: 'holdings', name: 'Investment Holdings' },
]

// @sig ReportButton :: { report: Object } -> ReactElement
const ReportButton = ({ report }) => {
    // Open a report view
    // @sig handleClick :: () -> void
    const handleClick = () => {
        const { id, type, name } = report
        const viewId = `rpt_${id}`
        const view = View.Report(viewId, type, name)
        post(Action.OpenView(view))
    }

    return (
        <Button variant="ghost" onClick={handleClick} style={{ justifyContent: 'flex-start', width: '100%' }}>
            <Flex justify="between" width="100%">
                <Text size="2">{report.name}</Text>
            </Flex>
        </Button>
    )
}

// @sig ReportsList :: () -> ReactElement
const ReportsList = () => (
    <Box>
        <Heading as="h3" size="3" m="3" style={{ fontWeight: 'lighter' }}>
            Reports
        </Heading>
        <Flex direction="column" gap="1" mx="3">
            {reports.map(report => (
                <ReportButton key={report.id} report={report} />
            ))}
        </Flex>
    </Box>
)

export { ReportsList }
