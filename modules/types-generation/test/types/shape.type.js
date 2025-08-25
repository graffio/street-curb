// Tagged sum type definition for Shape
export const Shape = {
    name: 'Shape',
    kind: 'taggedSum',
    variants: { Square: { topLeft: 'Coord', bottomRight: 'Coord' }, Circle: { centre: 'Coord', radius: 'Number' } },
}
