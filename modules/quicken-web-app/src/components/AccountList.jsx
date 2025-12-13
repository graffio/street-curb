// ABOUTME: Sidebar account list that opens register tabs on click
// ABOUTME: Reads accounts from Redux and dispatches OpenView actions

import { Box, Button, Flex, Heading, Text } from '@graffio/design-system'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'
import { View } from '../types/view.js'

// @sig handleAccountClick :: Account -> void
const handleAccountClick = account => {
    const viewId = `reg_${account.id}`
    const view = View.Register(viewId, account.id, account.name)
    post(Action.OpenView(view))
}

// @sig AccountButton :: { account: Account } -> ReactElement
const AccountButton = ({ account }) => (
    <Button
        variant="ghost"
        onClick={() => handleAccountClick(account)}
        style={{ justifyContent: 'flex-start', width: '100%' }}
    >
        <Flex justify="between" width="100%">
            <Text size="2">{account.name}</Text>
        </Flex>
    </Button>
)

// @sig AccountList :: () -> ReactElement
const AccountList = () => {
    const accounts = useSelector(S.accounts)

    if (!accounts || accounts.length === 0)
        return (
            <Box mx="3">
                <Text size="2" color="gray">
                    No accounts loaded
                </Text>
            </Box>
        )

    return (
        <Box>
            <Heading as="h3" size="3" m="3" style={{ fontWeight: 'lighter' }}>
                Accounts
            </Heading>
            <Flex direction="column" gap="1" mx="3">
                {accounts.map(account => (
                    <AccountButton key={account.id} account={account} />
                ))}
            </Flex>
        </Box>
    )
}

export { AccountList }
