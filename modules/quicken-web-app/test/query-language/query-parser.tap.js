import { test } from 'tap'
import { queryParser } from '../../src/query-language/query-parser.js'
import { Computation, DateRange, Domain, ExpressionNode, QueryFilter } from '../../src/types/index.js'

const parse = queryParser

// ═════════════════════════════════════════════════
// (a) Named query blocks with description
// ═════════════════════════════════════════════════

test('Named query blocks', t => {
    t.test('Given a query with a name and description', t => {
        t.test('When parsing', t => {
            const result = parse(`
query food_spending "Monthly food spending" {
  from transactions
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.equal(result.ir.name, 'food_spending', 'Then the name is extracted')
            t.equal(result.ir.description, 'Monthly food spending', 'Then the description is extracted')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with an underscore name', t => {
        t.test('When parsing', t => {
            const result = parse(`
query savings_rate_2025 "Savings rate for 2025" {
  from transactions
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.equal(result.ir.name, 'savings_rate_2025', 'Then the name with underscores and digits is extracted')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (b) Source declarations — transactions, holdings, accounts
// ═════════════════════════════════════════════════

test('Source declarations', t => {
    t.test('Given a query with a transactions source', t => {
        t.test('When parsing', t => {
            const result = parse(`
query txns "Transaction query" {
  from transactions
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.ok(result.ir.sources._default, 'Then a default source is created')
            t.ok(Domain.Transactions.is(result.ir.sources._default.domain), 'Then the domain is transactions')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with a holdings source', t => {
        t.test('When parsing', t => {
            const result = parse(`
query portfolio "Holdings query" {
  from holdings
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.ok(Domain.Holdings.is(result.ir.sources._default.domain), 'Then the domain is holdings')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with an accounts source', t => {
        t.test('When parsing', t => {
            const result = parse(`
query accts "Accounts query" {
  from accounts
  show name, type
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.ok(Domain.Accounts.is(result.ir.sources._default.domain), 'Then the domain is accounts')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with named sources', t => {
        t.test('When parsing', t => {
            const result = parse(`
query compare_food "Compare food spending" {
  q1: from transactions
      date Q1 2025
  q2: from transactions
      date Q2 2025
  compare q1 vs q2
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.ok(result.ir.sources.q1, 'Then source q1 exists')
            t.ok(result.ir.sources.q2, 'Then source q2 exists')
            t.ok(Domain.Transactions.is(result.ir.sources.q1.domain), 'Then q1 domain is transactions')
            t.ok(Domain.Transactions.is(result.ir.sources.q2.domain), 'Then q2 domain is transactions')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (c) Where clauses — category, account, payee, accountType with = and starts with
// ═════════════════════════════════════════════════

test('Where clauses', t => {
    t.test('Given a query with a category filter using =', t => {
        t.test('When parsing', t => {
            const result = parse(`
query food "Food spending" {
  from transactions
  where category = "Food:Dining"
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const filters = result.ir.sources._default.filters
            t.equal(filters.length, 1, 'Then there is one filter')
            t.equal(filters[0].field, 'category', 'Then the filter field is category')
            t.ok(QueryFilter.Equals.is(filters[0]), 'Then the filter is a QueryFilter.Equals')
            t.equal(filters[0].value, 'Food:Dining', 'Then the value is Food:Dining')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with an account filter', t => {
        t.test('When parsing', t => {
            const result = parse(`
query checking "Checking transactions" {
  from transactions
  where account = "Chase Checking"
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const filters = result.ir.sources._default.filters
            t.equal(filters[0].field, 'account', 'Then the filter field is account')
            t.equal(filters[0].value, 'Chase Checking', 'Then the value is Chase Checking')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with a payee filter', t => {
        t.test('When parsing', t => {
            const result = parse(`
query costco "Costco spending" {
  from transactions
  where payee = "Costco"
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const filters = result.ir.sources._default.filters
            t.equal(filters[0].field, 'payee', 'Then the filter field is payee')
            t.equal(filters[0].value, 'Costco', 'Then the value is Costco')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with an account type filter', t => {
        t.test('When parsing', t => {
            const result = parse(`
query bank "Bank transactions" {
  from transactions
  where account type = "Bank"
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const filters = result.ir.sources._default.filters
            t.equal(filters[0].field, 'accountType', 'Then the filter field is accountType')
            t.equal(filters[0].value, 'Bank', 'Then the value is Bank')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with multiple where clauses', t => {
        t.test('When parsing', t => {
            const result = parse(`
query specific "Specific transactions" {
  from transactions
  where category = "Food"
  where account = "Chase Checking"
  where payee = "Costco"
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const filters = result.ir.sources._default.filters
            t.equal(filters.length, 3, 'Then there are three filters')
            t.equal(filters[0].field, 'category', 'Then first filter is category')
            t.equal(filters[1].field, 'account', 'Then second filter is account')
            t.equal(filters[2].field, 'payee', 'Then third filter is payee')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (d) Date ranges — absolute and relative
// ═════════════════════════════════════════════════

test('Date ranges', t => {
    t.test('Given a query with an absolute ISO date range', t => {
        t.test('When parsing', t => {
            const result = parse(`
query yearly "Full year" {
  from transactions
  date 2025-01-01 to 2025-12-31
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const dateRange = result.ir.sources._default.dateRange
            t.ok(DateRange.Range.is(dateRange), 'Then the date range type is range')
            t.equal(dateRange.start, '2025-01-01', 'Then start is 2025-01-01')
            t.equal(dateRange.end, '2025-12-31', 'Then end is 2025-12-31')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with a bare year', t => {
        t.test('When parsing', t => {
            const result = parse(`
query y2025 "Year 2025" {
  from transactions
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const dateRange = result.ir.sources._default.dateRange
            t.ok(DateRange.Year.is(dateRange), 'Then the date range type is year')
            t.equal(dateRange.year, 2025, 'Then the year is 2025')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with "last 6 months"', t => {
        t.test('When parsing', t => {
            const result = parse(`
query recent "Recent spending" {
  from transactions
  date last 6 months
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const dateRange = result.ir.sources._default.dateRange
            t.ok(DateRange.Relative.is(dateRange), 'Then the date range type is relative')
            t.equal(dateRange.count, 6, 'Then the count is 6')
            t.equal(dateRange.unit, 'months', 'Then the unit is months')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with "last_quarter"', t => {
        t.test('When parsing', t => {
            const result = parse(`
query lq "Last quarter" {
  from transactions
  date last quarter
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const dateRange = result.ir.sources._default.dateRange
            t.ok(DateRange.Named.is(dateRange), 'Then the date range type is named')
            t.equal(dateRange.name, 'last_quarter', 'Then the name is last_quarter')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with "this_year"', t => {
        t.test('When parsing', t => {
            const result = parse(`
query ty "This year" {
  from transactions
  date this year
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const dateRange = result.ir.sources._default.dateRange
            t.ok(DateRange.Named.is(dateRange), 'Then the date range type is named')
            t.equal(dateRange.name, 'this_year', 'Then the name is this_year')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with a quarter date range', t => {
        t.test('When parsing', t => {
            const result = parse(`
query q1 "Q1 2025" {
  from transactions
  date Q1 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const dateRange = result.ir.sources._default.dateRange
            t.ok(DateRange.Quarter.is(dateRange), 'Then the date range type is quarter')
            t.equal(dateRange.quarter, 1, 'Then the quarter is 1')
            t.equal(dateRange.year, 2025, 'Then the year is 2025')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with a month name date range', t => {
        t.test('When parsing', t => {
            const result = parse(`
query jan "January 2025" {
  from transactions
  date January 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const dateRange = result.ir.sources._default.dateRange
            t.ok(DateRange.Month.is(dateRange), 'Then the date range type is month')
            t.equal(dateRange.month, 1, 'Then the month is 1')
            t.equal(dateRange.year, 2025, 'Then the year is 2025')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (e) Group by — month, quarter, category, security, account
// ═════════════════════════════════════════════════

test('Group by', t => {
    t.test('Given a query grouped by month', t => {
        t.test('When parsing', t => {
            const result = parse(`
query monthly "Monthly spending" {
  from transactions
  date 2025
  group by month
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.equal(result.ir.sources._default.groupBy, 'month', 'Then groupBy is month')
            t.end()
        })
        t.end()
    })

    t.test('Given a query grouped by quarter', t => {
        t.test('When parsing', t => {
            const result = parse(`
query quarterly "Quarterly spending" {
  from transactions
  date 2025
  group by quarter
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.equal(result.ir.sources._default.groupBy, 'quarter', 'Then groupBy is quarter')
            t.end()
        })
        t.end()
    })

    t.test('Given a query grouped by category', t => {
        t.test('When parsing', t => {
            const result = parse(`
query by_cat "By category" {
  from transactions
  date 2025
  group by category
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.equal(result.ir.sources._default.groupBy, 'category', 'Then groupBy is category')
            t.end()
        })
        t.end()
    })

    t.test('Given a query grouped by account', t => {
        t.test('When parsing', t => {
            const result = parse(`
query by_acct "By account" {
  from transactions
  date 2025
  group by account
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.equal(result.ir.sources._default.groupBy, 'account', 'Then groupBy is account')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (f) Show and format clauses
// ═════════════════════════════════════════════════

test('Show and format clauses', t => {
    t.test('Given a query with a show clause listing fields', t => {
        t.test('When parsing', t => {
            const result = parse(`
query detailed "Detailed view" {
  from transactions
  date 2025
  show total, difference, percent_change
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.same(result.ir.output.show, ['total', 'difference', 'percent_change'], 'Then show fields are extracted')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with a format clause', t => {
        t.test('When parsing', t => {
            const result = parse(`
query rate "Rate query" {
  from transactions
  date 2025
  show total
  format percent
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.equal(result.ir.output.format, 'percent', 'Then format is percent')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with both show and format', t => {
        t.test('When parsing', t => {
            const result = parse(`
query full "Full output" {
  from transactions
  date 2025
  show total, average
  format currency
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.same(result.ir.output.show, ['total', 'average'], 'Then show fields are extracted')
            t.equal(result.ir.output.format, 'currency', 'Then format is currency')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (g) Compare syntax
// ═════════════════════════════════════════════════

test('Compare syntax', t => {
    t.test('Given a query with compare source_a vs source_b', t => {
        t.test('When parsing', t => {
            const result = parse(`
query q1_vs_q2 "Q1 vs Q2 food spending" {
  q1: from transactions
      where category = "Food"
      date Q1 2025
  q2: from transactions
      where category = "Food"
      date Q2 2025
  compare q1 vs q2
  show total, difference, percent_change
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.ok(Computation.Compare.is(result.ir.computation), 'Then computation is a Compare variant')
            t.equal(result.ir.computation.left, 'q1', 'Then left source is q1')
            t.equal(result.ir.computation.right, 'q2', 'Then right source is q2')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (h) Compute/expression syntax — precedence, abs(), parens, source.field refs
// ═════════════════════════════════════════════════

test('Compute/expression syntax', t => {
    t.test('Given a query with a simple arithmetic expression', t => {
        t.test('When parsing', t => {
            const result = parse(`
query rate "Savings rate" {
  income: from transactions
          where category = "Income"
          date 2025
  expenses: from transactions
            where category = "Food"
            date 2025
  compute income.total - expenses.total
  format currency
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.ok(Computation.Expression.is(result.ir.computation), 'Then computation is an Expression variant')

            const expr = result.ir.computation.expression
            t.ok(ExpressionNode.Binary.is(expr), 'Then the expression is a Binary node')
            t.equal(expr.op, '-', 'Then the operator is subtraction')
            t.ok(ExpressionNode.Reference.is(expr.left), 'Then the left operand is a Reference')
            t.equal(expr.left.source, 'income', 'Then the left source is income')
            t.equal(expr.left.field, 'total', 'Then the left field is total')
            t.ok(ExpressionNode.Reference.is(expr.right), 'Then the right operand is a Reference')
            t.equal(expr.right.source, 'expenses', 'Then the right source is expenses')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with multiplication and division precedence', t => {
        t.test('When parsing 2 + 3 * 4', t => {
            // 2 + 3 * 4 should parse as 2 + (3 * 4) due to precedence
            const result = parse(`
query prec "Precedence test" {
  a: from transactions
     date 2025
  compute a.x + a.y * a.z
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const expr = result.ir.computation.expression
            t.ok(ExpressionNode.Binary.is(expr), 'Then top-level is Binary')
            t.equal(expr.op, '+', 'Then top-level operator is +')
            t.ok(ExpressionNode.Binary.is(expr.right), 'Then right child is Binary')
            t.equal(expr.right.op, '*', 'Then right child operator is *')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with parenthesized expression overriding precedence', t => {
        t.test('When parsing (a + b) * c', t => {
            const result = parse(`
query parens "Parens test" {
  s: from transactions
     date 2025
  compute (s.a + s.b) * s.c
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const expr = result.ir.computation.expression
            t.ok(ExpressionNode.Binary.is(expr), 'Then top-level is Binary')
            t.equal(expr.op, '*', 'Then top-level operator is *')
            t.ok(ExpressionNode.Binary.is(expr.left), 'Then left child is Binary')
            t.equal(expr.left.op, '+', 'Then left child operator is +')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with abs() function call', t => {
        t.test('When parsing abs(income.total - expenses.total)', t => {
            const result = parse(`
query abstest "Abs test" {
  income: from transactions
          where category = "Income"
          date 2025
  expenses: from transactions
            where category = "Food"
            date 2025
  compute abs(income.total - expenses.total)
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const expr = result.ir.computation.expression
            t.ok(ExpressionNode.Call.is(expr), 'Then the expression is a Call node')
            t.equal(expr.fn, 'abs', 'Then the function is abs')
            t.equal(expr.args.length, 1, 'Then there is one argument')
            t.ok(ExpressionNode.Binary.is(expr.args[0]), 'Then the argument is a Binary expression')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with a complex nested expression', t => {
        t.test('When parsing abs(income.total - expenses.total) / income.total * 100', t => {
            const result = parse(`
query savings "Savings rate" {
  income: from transactions
          where category = "Income"
          date 2025
  expenses: from transactions
            where category = "Food"
            date 2025
  compute abs(income.total - expenses.total) / income.total * 100
  format percent
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            const expr = result.ir.computation.expression

            // abs(...) / income.total * 100 → (abs(...) / income.total) * 100
            t.ok(ExpressionNode.Binary.is(expr), 'Then top-level is Binary')
            t.equal(expr.op, '*', 'Then top-level operator is *')
            t.ok(ExpressionNode.Literal.is(expr.right), 'Then right is a Literal')
            t.equal(expr.right.value, 100, 'Then right value is 100')
            t.ok(ExpressionNode.Binary.is(expr.left), 'Then left is Binary')
            t.equal(expr.left.op, '/', 'Then left operator is /')
            t.ok(ExpressionNode.Call.is(expr.left.left), 'Then left-left is a Call')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (i) Multi-source queries
// ═════════════════════════════════════════════════

test('Multi-source queries', t => {
    t.test('Given a query with three named sources', t => {
        t.test('When parsing', t => {
            const result = parse(`
query three_way "Three source comparison" {
  food: from transactions
        where category = "Food"
        date 2025
  housing: from transactions
           where category = "Housing"
           date 2025
  transport: from transactions
             where category = "Transportation"
             date 2025
  compute food.total + housing.total + transport.total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.ok(result.ir.sources.food, 'Then source food exists')
            t.ok(result.ir.sources.housing, 'Then source housing exists')
            t.ok(result.ir.sources.transport, 'Then source transport exists')
            t.ok(Domain.Transactions.is(result.ir.sources.food.domain), 'Then food is transactions')
            t.ok(Domain.Transactions.is(result.ir.sources.housing.domain), 'Then housing is transactions')
            t.ok(Domain.Transactions.is(result.ir.sources.transport.domain), 'Then transport is transactions')
            t.end()
        })
        t.end()
    })

    t.test('Given a query mixing transaction and holdings sources', t => {
        t.test('When parsing', t => {
            const result = parse(`
query mixed "Mixed sources" {
  txns: from transactions
        where category = "Income"
        date 2025
  portfolio: from holdings
             date 2025
  compute txns.total + portfolio.total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.ok(Domain.Transactions.is(result.ir.sources.txns.domain), 'Then txns is transactions')
            t.ok(Domain.Holdings.is(result.ir.sources.portfolio.domain), 'Then portfolio is holdings')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// Implicit computation type inference
// ═════════════════════════════════════════════════

test('Implicit computation type', t => {
    t.test('Given a transaction query with no explicit computation', t => {
        t.test('When parsing', t => {
            const result = parse(`
query food "Food spending" {
  from transactions
  where category = "Food"
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.ok(Computation.Identity.is(result.ir.computation), 'Then computation is Identity')
            t.end()
        })
        t.end()
    })

    t.test('Given an accounts query with no explicit computation', t => {
        t.test('When parsing', t => {
            const result = parse(`
query accts "All accounts" {
  from accounts
  show name, type
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.ok(
                Computation.FilterEntities.is(result.ir.computation),
                'Then computation is FilterEntities for accounts domain',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given a holdings query with no explicit computation', t => {
        t.test('When parsing', t => {
            const result = parse(`
query holdings "Portfolio holdings" {
  from holdings
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.ok(
                Computation.Identity.is(result.ir.computation),
                'Then computation is Identity for holdings domain (tree result)',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// Comments
// ═════════════════════════════════════════════════

test('Comments', t => {
    t.test('Given a query with line comments', t => {
        t.test('When parsing', t => {
            const result = parse(`
-- This is a comment
query food "Food spending" {
  from transactions
  -- Filter to food category only
  where category = "Food"
  date 2025
  show total
}
`)
            t.equal(result.success, true, 'Then parsing succeeds')
            t.equal(result.ir.name, 'food', 'Then comments are ignored')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (j) Error cases with line/col positions — minimum 8
// ═════════════════════════════════════════════════

test('Error cases', t => {
    // Error 1: Missing query keyword
    t.test('Given input without the query keyword', t => {
        t.test('When parsing', t => {
            const result = parse('food "Food" { from transactions show total }')

            t.equal(result.success, false, 'Then parsing fails')
            t.ok(result.errors.length > 0, 'Then there is at least one error')
            t.match(result.errors[0].message, /query/, 'Then the error mentions expected query keyword')
            t.ok(result.errors[0].line, 'Then the error has a line number')
            t.ok(result.errors[0].col, 'Then the error has a column number')
            t.end()
        })
        t.end()
    })

    // Error 2: Unclosed block (missing })
    t.test('Given a query with an unclosed block', t => {
        t.test('When parsing', t => {
            const result = parse(`
query food "Food" {
  from transactions
  show total
`)
            t.equal(result.success, false, 'Then parsing fails')
            t.ok(result.errors.length > 0, 'Then there is at least one error')
            t.match(result.errors[0].message, /}/, 'Then the error mentions expected closing brace')
            t.end()
        })
        t.end()
    })

    // Error 3: Missing source (no from clause)
    t.test('Given a query with no from clause', t => {
        t.test('When parsing', t => {
            const result = parse(`
query empty "Empty" {
  show total
}
`)
            t.equal(result.success, false, 'Then parsing fails')
            t.ok(result.errors.length > 0, 'Then there is at least one error')
            t.end()
        })
        t.end()
    })

    // Error 4: Invalid domain
    t.test('Given a query with an invalid domain', t => {
        t.test('When parsing', t => {
            const result = parse(`
query bad "Bad domain" {
  from invoices
  show total
}
`)
            t.equal(result.success, false, 'Then parsing fails')
            t.match(result.errors[0].message, /domain/, 'Then the error mentions domain')
            t.ok(result.errors[0].line, 'Then the error has a line number')
            t.ok(result.errors[0].col, 'Then the error has a column number')
            t.end()
        })
        t.end()
    })

    // Error 5: Unterminated string
    t.test('Given a query with an unterminated string', t => {
        t.test('When parsing', t => {
            const result = parse(`
query bad "Unterminated {
  from transactions
  show total
}
`)
            t.equal(result.success, false, 'Then parsing fails')
            t.match(result.errors[0].message, /string/i, 'Then the error mentions unterminated string')
            t.end()
        })
        t.end()
    })

    // Error 6: Bad expression — unexpected token
    t.test('Given a query with an invalid expression', t => {
        t.test('When parsing', t => {
            const result = parse(`
query bad "Bad expr" {
  a: from transactions
     date 2025
  compute + a.total
}
`)
            t.equal(result.success, false, 'Then parsing fails')
            t.ok(result.errors[0].line, 'Then the error has a line number')
            t.end()
        })
        t.end()
    })

    // Error 7: Missing description string
    t.test('Given a query without a description string', t => {
        t.test('When parsing', t => {
            const result = parse(`
query food {
  from transactions
  show total
}
`)
            t.equal(result.success, false, 'Then parsing fails')
            t.match(result.errors[0].message, /string/i, 'Then the error mentions expected string')
            t.end()
        })
        t.end()
    })

    // Error 8: Where clause without preceding from
    t.test('Given a where clause before any from declaration', t => {
        t.test('When parsing', t => {
            const result = parse(`
query bad "Bad order" {
  where category = "Food"
  from transactions
  show total
}
`)
            t.equal(result.success, false, 'Then parsing fails')
            t.match(result.errors[0].message, /where.*from/i, 'Then the error mentions where without from')
            t.end()
        })
        t.end()
    })

    // Error 9: Invalid group by dimension
    t.test('Given a query with an invalid group by dimension', t => {
        t.test('When parsing', t => {
            const result = parse(`
query bad "Bad group" {
  from transactions
  date 2025
  group by color
  show total
}
`)
            t.equal(result.success, false, 'Then parsing fails')
            t.match(result.errors[0].message, /group dimension/i, 'Then the error mentions group dimension')
            t.end()
        })
        t.end()
    })

    // Error 10: Unexpected character
    t.test('Given a query with an unexpected character', t => {
        t.test('When parsing', t => {
            const result = parse(`
query bad "Bad char" {
  from transactions
  where category = "Food" @
  show total
}
`)
            t.equal(result.success, false, 'Then parsing fails')
            t.match(result.errors[0].message, /[Uu]nexpected/, 'Then the error mentions unexpected')
            t.ok(result.errors[0].line, 'Then the error has a line number')
            t.ok(result.errors[0].col, 'Then the error has a column number')
            t.end()
        })
        t.end()
    })

    // Error 11: Trailing content after query block
    t.test('Given trailing content after the query block', t => {
        t.test('When parsing', t => {
            const result = parse(`
query food "Food" {
  from transactions
  show total
} extra stuff
`)
            t.equal(result.success, false, 'Then parsing fails')
            t.match(result.errors[0].message, /after query/, 'Then the error mentions content after query')
            t.end()
        })
        t.end()
    })

    t.end()
})
