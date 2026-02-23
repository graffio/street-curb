// ABOUTME: Pattern recognition for JavaScript AST nodes
// ABOUTME: Detects common patterns like style objects, cohesion groups

import { AstNode } from './ast-node.js'
import { Ast } from './ast.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Check if object expression appears to be a style object (>50% CSS properties)
    // @sig isStyleObject :: AstNode -> Boolean
    isStyleObject: node => {
        if (!AstNode.ObjectExpression.is(node)) return false
        const props = node.properties
        if (props.length === 0) return false
        const names = props.map(p => p.name).filter(Boolean)
        const cssCount = names.filter(name => STYLE_PROPERTIES.has(name)).length
        return cssCount >= Math.ceil(names.length / 2) && cssCount >= 2
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const STYLE_PROPERTIES = new Set([
    'alignItems', 'background', 'backgroundColor', 'border', 'borderCollapse', 'borderRadius', 'bottom', 'boxShadow',
    'color', 'cursor', 'display', 'flex', 'flexDirection', 'flexWrap', 'fontSize', 'fontStyle', 'fontWeight', 'gap',
    'gridTemplateColumns', 'gridTemplateRows', 'height', 'justifyContent', 'left', 'letterSpacing', 'lineHeight',
    'margin', 'maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'opacity', 'outline', 'overflow', 'overflowX',
    'overflowY', 'padding', 'position', 'right', 'tableLayout', 'textAlign', 'textDecoration', 'top', 'transform',
    'transition', 'whiteSpace', 'width', 'wordBreak', 'zIndex',
])

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Count style objects in an AST subtree
// @sig countStyleObjects :: (ESTreeAST | AstNode) -> Number
const countStyleObjects = node => {
    const nodes = AstNode.isASTNode(node) ? Ast.descendants(node) : Ast.from(node)
    return nodes.filter(P.isStyleObject).length
}

export { countStyleObjects }
