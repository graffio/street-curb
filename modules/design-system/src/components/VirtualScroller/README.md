# VirtualScroller Component

A minimal, performant virtual scrolling implementation for large lists.

## Architecture Overview

The VirtualScroller is built using two main pieces:

1. **useVirtualScroll.js** - Core hook that manages virtual scrolling logic
2. **VirtualScroller.jsx** - React component that provides the UI

## Features

- ✅ Virtual rendering using @tanstack/react-virtual
- ✅ Optional row snapping with 50% rule for mouse, directional for keyboard
- ✅ Custom arrow key scrolling (exact rowHeight jumps)
- ✅ Standard browser scrollbar

### Keyboard Behavior
- **Arrow keys**: Custom implementation that scrolls exactly one `rowHeight` per press
- **Mouse/touch**: Uses browser default scrolling
- **Snapping**: Immediate for keyboard (directional), immediate for mouse (50% rule)

### Scroll Direction Logic
- **Keyboard scrolling**: Direction known from arrow key, snaps up/down accordingly
- **Mouse scrolling**: Direction unknown, uses 50% rule (snap to closest row edge)

## Usage

```jsx
import { VirtualScroller } from './VirtualScroller'

const MyList = () => (
    <VirtualScroller 
        rowCount={10000}
        rowHeight={60}
        height={600}
        enableSnap={true}
        renderRow={index => `Row ${index}`}
    />
)
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| rowCount | number | required | Total number of rows |
| rowHeight | number | required | Height of each row in pixels |
| height | number | 600 | Container height |
| overscan | number | 5 | Extra rows to render outside viewport |
| enableSnap | boolean | false | Enable row snapping after scroll |
| renderRow | function | null | Custom row renderer (index) => ReactElement |
| onScroll | function | null | Scroll callback ({scrollTop, direction}) => void |
| onRowMount | function | null | Row mount callback (index, element) => void |

## Implementation Notes

### Following Functional Programming Conventions
- Functions defined before variables ("functions first" rule)
- Single level of indentation per function
- Early returns instead of nested if/else
- No unnecessary braces
- Export statements at bottom of files

### Performance Considerations
- Uses @tanstack/react-virtual for efficient DOM management
- Only renders visible rows plus overscan
- Immediate snapping prevents jarring delayed movements
- Custom keyboard handling ensures precise row navigation

### Browser Compatibility
- Relies on native scrollbar for accessibility
- Uses standard scroll events for mouse/touch
- Custom keyboard handling for precise navigation
- Focus management with tabIndex for keyboard access
