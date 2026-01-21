// ABOUTME: Design system facade re-exporting Radix Themes components
// ABOUTME: Import from this package instead of @radix-ui/themes directly
// COMPLEXITY: exports — barrel file re-exporting Radix + our components as unified API

// Import Radix Themes CSS
import '@radix-ui/themes/styles.css'

import {
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    Checkbox,
    Container,
    Flex,
    Grid,
    Heading,
    Popover,
    Progress,
    ScrollArea,
    Section,
    Select,
    Separator,
    Slider,
    Spinner,
    Switch,
    Table as RadixTable,
    Tabs,
    Text,
    TextField,
    Theme,
    Tooltip,
} from '@radix-ui/themes'

import { CategorySelector } from './components/CategorySelector.jsx'
import { DataTable } from './components/DataTable.jsx'
import { Dialog } from './components/Dialog/Dialog.jsx'
import { FilePickerButton } from './components/FilePickerButton.jsx'
import { KeyboardDateInput } from './components/KeyboardDateInput.jsx'
import { KeymapDrawer } from './components/KeymapDrawer.jsx'
import { LoadingSpinner } from './components/LoadingSpinner.jsx'
import { MainLayout } from './components/MainLayout.jsx'
import { Table } from './components/Table.jsx'
import { TitleAndSubtitle } from './components/TitleAndSubtitle.jsx'
import { DateRangePicker } from './DateRangePicker.jsx'
import { lookupTablePropType } from './prop-types/lookup-table-prop-type.js'
import { calculateDateRange, DATE_RANGES } from './utils/date-range-utils.js'

export {
    // facade for Radix Themes
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    Checkbox,
    Container,
    Flex,
    Grid,
    Heading,
    Popover,
    Progress,
    RadixTable,
    ScrollArea,
    Section,
    Select,
    Separator,
    Slider,
    Spinner,
    Switch,
    Table,
    Tabs,
    Text,
    TextField,
    Theme,
    Tooltip,

    // ours
    CategorySelector,
    DataTable,
    DateRangePicker,
    Dialog,
    FilePickerButton,
    KeyboardDateInput,
    KeymapDrawer,
    LoadingSpinner,
    MainLayout,
    TitleAndSubtitle,

    // PropTypes
    lookupTablePropType,

    // Date range utilities
    calculateDateRange,
    DATE_RANGES,
}
