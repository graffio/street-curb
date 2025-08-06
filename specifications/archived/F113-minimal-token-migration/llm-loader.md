# F113: Minimal Token Migration for SegmentedCurbEditor

## Overview
Replace hardcoded design values with design system tokens in SegmentedCurbEditor components. This is a minimal migration that preserves all existing functionality while integrating with the design system.

## Key Principles
- **Minimal changes** - only replace hardcoded values with tokens
- **Preserve functionality** - zero breaking changes to drag/drop, resizing, etc.
- **Keep existing components** - no Radix component replacement
- **Simple validation** - just ensure it still works

## Files to Modify
- `modules/right-of-way-editor/src/components/SegmentedCurbEditor/SegmentedCurbEditor.jsx`
- `modules/right-of-way-editor/src/components/SegmentedCurbEditor/SegmentRenderer.jsx`
- `modules/right-of-way-editor/src/components/SegmentedCurbEditor/DividerLayer.jsx`
- `modules/right-of-way-editor/src/components/SegmentedCurbEditor/LabelLayer.jsx`

## Success Criteria
- All existing functionality preserved
- Visual appearance unchanged
- Performance maintained
- No breaking changes 