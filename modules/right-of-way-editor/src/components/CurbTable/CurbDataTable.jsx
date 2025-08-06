import { forwardRef } from 'react'
import { Table as RadixTable } from '@radix-ui/themes'
import { tableStyles } from './CurbDataTable.css.js'

/**
 * CurbDataTable - specialized table component for curb segment data
 * @sig CurbDataTable :: ({ 
 *   data: [Object], 
 *   columns: [Column], 
 *   onRowClick?: Function, 
 *   selectedRowId?: String, 
 *   size?: String,
 *   variant?: String,
 *   className?: String 
 * }) -> JSXElement
 */
const CurbDataTable = forwardRef(({ 
    data = [], 
    columns = [], 
    onRowClick, 
    selectedRowId, 
    size = "2", 
    variant = "surface",
    className = "",
    ...props 
}, ref) => {
    const handleRowClick = (row, index) => onRowClick && onRowClick(row, index)
    
    /**
     * Renders column header cell
     * @sig renderColumnHeader :: (Column, Number) -> JSXElement
     */
    const renderColumnHeader = (column, index) => (
        <RadixTable.ColumnHeaderCell 
            key={column.key || index}
            className={tableStyles.headerCell}
            justify={column.align || 'start'}
            style={{ width: column.width }}
        >
            {column.header}
        </RadixTable.ColumnHeaderCell>
    )
    
    /**
     * Renders data table cell
     * @sig renderTableCell :: (Column, Number, Object, Number) -> JSXElement
     */
    const renderTableCell = (column, colIndex, row, index) => {
        const cellContent = column.render 
            ? column.render(row, index)
            : row[column.key]
        
        const CellComponent = colIndex === 0 && column.isRowHeader 
            ? RadixTable.RowHeaderCell 
            : RadixTable.Cell

        return (
            <CellComponent
                key={column.key || colIndex}
                className={`${tableStyles.cell} ${column.className || ''}`}
                justify={column.align || 'start'}
                onClick={column.onClick ? (e) => {
                    e.stopPropagation()
                    column.onClick(row, index, e)
                } : undefined}
                style={{ 
                    cursor: column.onClick ? 'pointer' : 'inherit',
                    ...column.cellStyle
                }}
            >
                {cellContent}
            </CellComponent>
        )
    }
    
    /**
     * Renders data row with cells
     * @sig renderDataRow :: (Object, Number) -> JSXElement
     */
    const renderDataRow = (row, index) => {
        const isSelected = selectedRowId && row.id === selectedRowId
        const rowClassName = `${tableStyles.row} ${isSelected ? tableStyles.selectedRow : ''}`
        
        return (
            <RadixTable.Row 
                key={row.id || index}
                className={rowClassName}
                onClick={() => handleRowClick(row, index)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
                {columns.map((column, colIndex) => renderTableCell(column, colIndex, row, index))}
            </RadixTable.Row>
        )
    }

    return (
        <div className={`${tableStyles.wrapper} ${className}`}>
            <RadixTable.Root 
                ref={ref} 
                size={size} 
                variant={variant}
                className={tableStyles.root}
                {...props}
            >
                <RadixTable.Header>
                    <RadixTable.Row>
                        {columns.map(renderColumnHeader)}
                    </RadixTable.Row>
                </RadixTable.Header>
                <RadixTable.Body>
                    {data.length === 0 ? (
                        <RadixTable.Row>
                            <RadixTable.Cell 
                                colSpan={columns.length}
                                className={tableStyles.emptyCell}
                                justify="center"
                            >
                                <div className={tableStyles.emptyMessage}>
                                    No data available
                                </div>
                            </RadixTable.Cell>
                        </RadixTable.Row>
                    ) : (
                        data.map(renderDataRow)
                    )}
                </RadixTable.Body>
            </RadixTable.Root>
        </div>
    )
})

CurbDataTable.displayName = 'CurbDataTable'

export { CurbDataTable }