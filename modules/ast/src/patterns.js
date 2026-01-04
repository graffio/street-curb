// ABOUTME: Pattern recognition for JavaScript AST nodes
// ABOUTME: Detects common patterns like style objects, cohesion groups

import { ASTNode } from './ast-node-methods.js'
import { AST } from './ast.js'

// prettier-ignore
const STYLE_PROPERTIES = new Set([
    'alignItems', 'background', 'backgroundColor', 'border', 'borderCollapse', 'borderRadius', 'bottom', 'boxShadow',
    'color', 'cursor', 'display', 'flex', 'flexDirection', 'flexWrap', 'fontSize', 'fontStyle', 'fontWeight', 'gap',
    'gridTemplateColumns', 'gridTemplateRows', 'height', 'justifyContent', 'left', 'letterSpacing', 'lineHeight',
    'margin', 'maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'opacity', 'outline', 'overflow', 'overflowX',
    'overflowY', 'padding', 'position', 'right', 'tableLayout', 'textAlign', 'textDecoration', 'top', 'transform',
    'transition', 'whiteSpace', 'width', 'wordBreak', 'zIndex',
])

const P = {
    // Check if object expression appears to be a style object (>50% CSS properties)
    // @sig isStyleObject :: ASTNode -> Boolean
    isStyleObject: node => {
        if (!ASTNode.ObjectExpression.is(node)) return false
        const props = node.properties
        if (props.length === 0) return false
        const names = props.map(p => p.name).filter(Boolean)
        const cssCount = names.filter(name => STYLE_PROPERTIES.has(name)).length
        return cssCount >= Math.ceil(names.length / 2) && cssCount >= 2
    },
}

// Count style objects in an AST subtree
// @sig countStyleObjects :: (ESTreeAST | ASTNode) -> Number
const countStyleObjects = node => {
    const nodes = ASTNode.isASTNode(node) ? AST.descendants(node) : AST.from(node)
    return nodes.filter(P.isStyleObject).length
}

export { countStyleObjects }
