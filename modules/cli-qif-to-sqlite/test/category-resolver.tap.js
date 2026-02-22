// ABOUTME: Tests for category-resolver.js
// ABOUTME: Verifies parsing of QIF category syntax (transfers, gain markers, regular categories)

import t from 'tap'
import { CategoryResolver } from '../src/category-resolver.js'

const { isTransfer, isGainMarker, isSplitMarker, toTransferAccountName, toCategoryName, resolveCategory } =
    CategoryResolver

t.test('CategoryResolver', t => {
    t.test('isTransfer', t => {
        t.test('Given a transfer category "[Checking]"', t => {
            t.test('When checking if it is a transfer', t => {
                t.equal(isTransfer('[Checking]'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given a transfer with category "[Checking]/Food"', t => {
            t.test('When checking if it is a transfer', t => {
                t.equal(isTransfer('[Checking]/Food'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given a regular category "Food:Groceries"', t => {
            t.test('When checking if it is a transfer', t => {
                t.equal(isTransfer('Food:Groceries'), false, 'Then it returns false')
                t.end()
            })
            t.end()
        })

        t.test('Given null', t => {
            t.test('When checking if it is a transfer', t => {
                t.equal(isTransfer(null), false, 'Then it returns false')
                t.end()
            })
            t.end()
        })

        t.test('Given undefined', t => {
            t.test('When checking if it is a transfer', t => {
                t.equal(isTransfer(undefined), false, 'Then it returns false')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('isGainMarker', t => {
        t.test('Given "CGLong"', t => {
            t.test('When checking if it is a gain marker', t => {
                t.equal(isGainMarker('CGLong'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given "CGShort"', t => {
            t.test('When checking if it is a gain marker', t => {
                t.equal(isGainMarker('CGShort'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given "CGMid"', t => {
            t.test('When checking if it is a gain marker', t => {
                t.equal(isGainMarker('CGMid'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given a regular category', t => {
            t.test('When checking if it is a gain marker', t => {
                t.equal(isGainMarker('Food'), false, 'Then it returns false')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('isSplitMarker', t => {
        t.test('Given "--Split--"', t => {
            t.test('When checking if it is a split marker', t => {
                t.equal(isSplitMarker('--Split--'), true, 'Then it returns true')
                t.end()
            })
            t.end()
        })

        t.test('Given a regular category', t => {
            t.test('When checking if it is a split marker', t => {
                t.equal(isSplitMarker('Food'), false, 'Then it returns false')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('toTransferAccountName', t => {
        t.test('Given a transfer "[Checking]"', t => {
            t.test('When extracting the account name', t => {
                t.equal(toTransferAccountName('[Checking]'), 'Checking', 'Then it returns "Checking"')
                t.end()
            })
            t.end()
        })

        t.test('Given a transfer with category "[Savings]/Food"', t => {
            t.test('When extracting the account name', t => {
                t.equal(toTransferAccountName('[Savings]/Food'), 'Savings', 'Then it returns "Savings"')
                t.end()
            })
            t.end()
        })

        t.test('Given an account name with spaces "[My Checking Account]"', t => {
            t.test('When extracting the account name', t => {
                const result = toTransferAccountName('[My Checking Account]')
                t.equal(result, 'My Checking Account', 'Then it returns "My Checking Account"')
                t.end()
            })
            t.end()
        })

        t.test('Given a regular category', t => {
            t.test('When extracting the account name', t => {
                t.equal(toTransferAccountName('Food'), undefined, 'Then it returns undefined')
                t.end()
            })
            t.end()
        })

        t.test('Given null', t => {
            t.test('When extracting the account name', t => {
                t.equal(toTransferAccountName(null), undefined, 'Then it returns undefined')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('toCategoryName', t => {
        t.test('Given a regular category "Food:Groceries"', t => {
            t.test('When extracting the category name', t => {
                t.equal(toCategoryName('Food:Groceries'), 'Food:Groceries', 'Then it returns the category')
                t.end()
            })
            t.end()
        })

        t.test('Given a pure transfer "[Checking]"', t => {
            t.test('When extracting the category name', t => {
                t.equal(toCategoryName('[Checking]'), undefined, 'Then it returns undefined')
                t.end()
            })
            t.end()
        })

        t.test('Given a transfer with category "[Checking]/Food"', t => {
            t.test('When extracting the category name', t => {
                t.equal(toCategoryName('[Checking]/Food'), 'Food', 'Then it returns "Food"')
                t.end()
            })
            t.end()
        })

        t.test('Given a gain marker "CGLong"', t => {
            t.test('When extracting the category name', t => {
                t.equal(toCategoryName('CGLong'), undefined, 'Then it returns undefined')
                t.end()
            })
            t.end()
        })

        t.test('Given a split marker "--Split--"', t => {
            t.test('When extracting the category name', t => {
                t.equal(toCategoryName('--Split--'), undefined, 'Then it returns undefined')
                t.end()
            })
            t.end()
        })

        t.test('Given null', t => {
            t.test('When extracting the category name', t => {
                t.equal(toCategoryName(null), undefined, 'Then it returns undefined')
                t.end()
            })
            t.end()
        })

        t.test('Given undefined', t => {
            t.test('When extracting the category name', t => {
                t.equal(toCategoryName(undefined), undefined, 'Then it returns undefined')
                t.end()
            })
            t.end()
        })
        t.end()
    })

    t.test('resolveCategory', t => {
        t.test('Given a regular category "Food:Groceries"', t => {
            t.test('When resolving the category', t => {
                const result = resolveCategory('Food:Groceries')
                t.same(
                    result,
                    { categoryName: 'Food:Groceries', transferAccountName: undefined, gainMarkerType: undefined },
                    'Then it returns categoryName only',
                )
                t.end()
            })
            t.end()
        })

        t.test('Given a pure transfer "[Checking]"', t => {
            t.test('When resolving the category', t => {
                const result = resolveCategory('[Checking]')
                t.same(
                    result,
                    { categoryName: undefined, transferAccountName: 'Checking', gainMarkerType: undefined },
                    'Then it returns transferAccountName only',
                )
                t.end()
            })
            t.end()
        })

        t.test('Given a transfer with category "[Savings]/Food"', t => {
            t.test('When resolving the category', t => {
                const result = resolveCategory('[Savings]/Food')
                t.same(
                    result,
                    { categoryName: 'Food', transferAccountName: 'Savings', gainMarkerType: undefined },
                    'Then it returns both categoryName and transferAccountName',
                )
                t.end()
            })
            t.end()
        })

        t.test('Given a gain marker "CGLong"', t => {
            t.test('When resolving the category', t => {
                const result = resolveCategory('CGLong')
                t.same(
                    result,
                    { categoryName: undefined, transferAccountName: undefined, gainMarkerType: 'CGLong' },
                    'Then it returns gainMarkerType only',
                )
                t.end()
            })
            t.end()
        })

        t.test('Given a split marker "--Split--"', t => {
            t.test('When resolving the category', t => {
                const result = resolveCategory('--Split--')
                t.same(
                    result,
                    { categoryName: undefined, transferAccountName: undefined, gainMarkerType: undefined },
                    'Then it returns all undefined',
                )
                t.end()
            })
            t.end()
        })

        t.test('Given null', t => {
            t.test('When resolving the category', t => {
                const result = resolveCategory(null)
                t.same(
                    result,
                    { categoryName: undefined, transferAccountName: undefined, gainMarkerType: undefined },
                    'Then it returns all undefined',
                )
                t.end()
            })
            t.end()
        })
        t.end()
    })
    t.end()
})
