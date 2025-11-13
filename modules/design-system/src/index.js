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
    Progress,
    ScrollArea,
    Section,
    Select,
    Separator,
    Slider,
    Switch,
    Table as RadixTable,
    Tabs,
    Text,
    TextField,
    Tooltip,
} from '@radix-ui/themes'

// Channel system
import { createChannel, layoutChannel, useChannel } from './channels/index.js'
import { CategorySelector } from './components/CategorySelector.jsx'
import { Dialog } from './components/Dialog/Dialog.jsx'
import { KeyboardDateInput } from './components/KeyboardDateInput.jsx'
import { LoadingSpinner } from './components/LoadingSpinner.jsx'
import { MainLayout } from './components/MainLayout.jsx'
import { Table } from './components/Table.jsx'
import { TitleAndSubtitle } from './components/TitleAndSubtitle.jsx'
import { VirtualTable } from './components/VirtualTable.jsx'
import { DateRangePicker } from './DateRangePicker.jsx'
import { lookupTablePropType } from './prop-types/lookup-table-prop-type.js'

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
    Progress,
    RadixTable,
    ScrollArea,
    Section,
    Select,
    Separator,
    Slider,
    Switch,
    Table,
    Tabs,
    Text,
    TextField,
    Tooltip,

    // ours
    CategorySelector,
    DateRangePicker,
    Dialog,
    KeyboardDateInput,
    LoadingSpinner,
    MainLayout,
    TitleAndSubtitle,
    VirtualTable,

    // channel
    createChannel,
    useChannel,
    layoutChannel,

    // PropTypes
    lookupTablePropType,
}
