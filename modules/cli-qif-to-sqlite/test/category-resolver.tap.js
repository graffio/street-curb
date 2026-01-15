// ABOUTME: Tests for category-resolver.js
// ABOUTME: Verifies parsing of QIF category syntax (transfers, gain markers, regular categories)

import t from 'tap'
import { CategoryResolver } from '../src/category-resolver.js'

const { P, T, F } = CategoryResolver

t.test('CategoryResolver', t => {
    t.test('P.isTransfer', t => {
        t.test('Given a transfer category "[Checking]"', t => {
            t.test('When checking if it is a transfer', t => {
                t.equal(P.isTransfer('[Checking]'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given a transfer with category "[Checking]/Food"', t => {
            t.test('When checking if it is a transfer', t => {
                t.equal(P.isTransfer('[Checking]/Food'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given a regular category "Food:Groceries"', t => {
            t.test('When checking if it is a transfer', t => {
                t.equal(P.isTransfer('Food:Groceries'), false, 'Then it returns false')
                t.end()
            })
            t.end()
        })

        t.test('Given null', t => {
            t.test('When checking if it is a transfer', t => {
                t.equal(P.isTransfer(null), false, 'Then it returns false')
                t.end()
            })
            t.end()
        })

        t.test('Given undefined', t => {
            t.test('When checking if it is a transfer', t => {
                t.equal(P.isTransfer(undefined), false, 'Then it returns false')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('P.isGainMarker', t => {
        t.test('Given "CGLong"', t => {
            t.test('When checking if it is a gain marker', t => {
                t.equal(P.isGainMarker('CGLong'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given "CGShort"', t => {
            t.test('When checking if it is a gain marker', t => {
                t.equal(P.isGainMarker('CGShort'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given "CGMid"', t => {
            t.test('When checking if it is a gain marker', t => {
                t.equal(P.isGainMarker('CGMid'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given a regular category', t => {
            t.test('When checking if it is a gain marker', t => {
                t.equal(P.isGainMarker('Food'), false, 'Then it returns false')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('P.isSplitMarker', t => {
        t.test('Given "--Split--"', t => {
            t.test('When checking if it is a split marker', t => {
                t.equal(P.isSplitMarker('--Split--'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given a regular category', t => {
            t.test('When checking if it is a split marker', t => {
                t.equal(P.isSplitMarker('Food'), false, 'Then it returns false')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('T.toTransferAccountName', t => {
        t.test('Given a transfer "[Checking]"', t => {
            t.test('When extracting the account name', t => {
                t.equal(T.toTransferAccountName('[Checking]'), 'Checking', 'Then it returns "Checking"')
                t.end()
            })
            t.end()
        })

        t.test('Given a transfer with category "[Savings]/Food"', t => {
            t.test('When extracting the account name', t => {
                t.equal(T.toTransferAccountName('[Savings]/Food'), 'Savings', 'Then it returns "Savings"')
                t.end()
            })
            t.end()
        })

        t.test('Given an account name with spaces "[My Checking Account]"', t => {
            t.test('When extracting the account name', t => {
                const result = T.toTransferAccountName('[My Checking Account]')
                t.equal(result, 'My Checking Account', 'Then it returns "My Checking Account"')
                t.end()
            })
            t.end()
        })

        t.test('Given a regular category', t => {
            t.test('When extracting the account name', t => {
                t.equal(T.toTransferAccountName('Food'), null, 'Then it returns null')
                t.end()
            })
            t.end()
        })

        t.test('Given null', t => {
            t.test('When extracting the account name', t => {
                t.equal(T.toTransferAccountName(null), null, 'Then it returns null')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('T.toCategoryName', t => {
        t.test('Given a regular category "Food:Groceries"', t => {
            t.test('When extracting the category name', t => {
                t.equal(T.toCategoryName('Food:Groceries'), 'Food:Groceries', 'Then it returns the category')
                t.end()
            })
            t.end()
        })

        t.test('Given a pure transfer "[Checking]"', t => {
            t.test('When extracting the category name', t => {
                t.equal(T.toCategoryName('[Checking]'), null, 'Then it returns null')
                t.end()
            })
            t.end()
        })

        t.test('Given a transfer with category "[Checking]/Food"', t => {
            t.test('When extracting the category name', t => {
                t.equal(T.toCategoryName('[Checking]/Food'), 'Food', 'Then it returns "Food"')
                t.end()
            })
            t.end()
        })

        t.test('Given a gain marker "CGLong"', t => {
            t.test('When extracting the category name', t => {
                t.equal(T.toCategoryName('CGLong'), null, 'Then it returns null')
                t.end()
            })
            t.end()
        })

        t.test('Given a split marker "--Split--"', t => {
            t.test('When extracting the category name', t => {
                t.equal(T.toCategoryName('--Split--'), null, 'Then it returns null')
                t.end()
            })
            t.end()
        })

        t.test('Given null', t => {
            t.test('When extracting the category name', t => {
                t.equal(T.toCategoryName(null), null, 'Then it returns null')
                t.end()
            })
            t.end()
        })

        t.test('Given undefined', t => {
            t.test('When extracting the category name', t => {
                t.equal(T.toCategoryName(undefined), null, 'Then it returns null')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('F.resolveCategory', t => {
        t.test('Given a regular category "Food:Groceries"', t => {
            t.test('When resolving the category', t => {
                const result = F.resolveCategory('Food:Groceries')
                t.same(
                    result,
                    { categoryName: 'Food:Groceries', transferAccountName: null, gainMarkerType: null },
                    'Then it returns categoryName only',
                )
                t.end()
            })
            t.end()
        })

        t.test('Given a pure transfer "[Checking]"', t => {
            t.test('When resolving the category', t => {
                const result = F.resolveCategory('[Checking]')
                t.same(
                    result,
                    { categoryName: null, transferAccountName: 'Checking', gainMarkerType: null },
                    'Then it returns transferAccountName only',
                )
                t.end()
            })
            t.end()
        })

        t.test('Given a transfer with category "[Savings]/Food"', t => {
            t.test('When resolving the category', t => {
                const result = F.resolveCategory('[Savings]/Food')
                t.same(
                    result,
                    { categoryName: 'Food', transferAccountName: 'Savings', gainMarkerType: null },
                    'Then it returns both categoryName and transferAccountName',
                )
                t.end()
            })
            t.end()
        })

        t.test('Given a gain marker "CGLong"', t => {
            t.test('When resolving the category', t => {
                const result = F.resolveCategory('CGLong')
                t.same(
                    result,
                    { categoryName: null, transferAccountName: null, gainMarkerType: 'CGLong' },
                    'Then it returns gainMarkerType only',
                )
                t.end()
            })
            t.end()
        })

        t.test('Given a split marker "--Split--"', t => {
            t.test('When resolving the category', t => {
                const result = F.resolveCategory('--Split--')
                t.same(
                    result,
                    { categoryName: null, transferAccountName: null, gainMarkerType: null },
                    'Then it returns all nulls',
                )
                t.end()
            })
            t.end()
        })

        t.test('Given null', t => {
            t.test('When resolving the category', t => {
                const result = F.resolveCategory(null)
                t.same(
                    result,
                    { categoryName: null, transferAccountName: null, gainMarkerType: null },
                    'Then it returns all nulls',
                )
                t.end()
            })
            t.end()
        })
        t.end()
    })
    t.end()
})
