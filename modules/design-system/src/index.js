// Import Radix Themes CSS
import '@radix-ui/themes/styles.css'

// Channel system
import { createChannel, layoutChannel, useChannel } from './channels/index.js'
import { CategorySelector } from './components/CategorySelector/CategorySelector.jsx'
import { DateRangePicker } from './components/DateRangePicker/DateRangePicker.jsx'
import { Dialog } from './components/Dialog/Dialog.jsx'
import { KeyboardDateInput } from './components/KeyboardDateInput/KeyboardDateInput.jsx'
import { MainLayout } from './components/layout/MainLayout.jsx'
import { Sidebar } from './components/layout/Sidebar.jsx'
import { TopBar } from './components/layout/TopBar.jsx'
import { TitleAndSubtitle } from './components/TitleAndSubtitle/TitleAndSubtitle.jsx'
import { VirtualTable } from './components/VirtualTable/VirtualTable.jsx'
import { MainTheme } from './themes/theme.jsx'

// Theme system
import { tokens } from './themes/tokens.css.js'

// Re-export core Radix Themes components (starting with confirmed exports)
import {
    Button,
    Card,
    Text,
    Heading,
    TextField,
    Badge,
    Avatar,
    Separator,
    Box,
    Flex,
    Grid,
    Container,
    Section,
    Tooltip,
    Progress,
    Switch,
    Checkbox,
    Slider,
    Tabs,
    ScrollArea,
    Select,
} from '@radix-ui/themes'

export {
    Button,
    Card,
    Text,
    Heading,
    TextField,
    Badge,
    Avatar,
    Separator,
    Box,
    Flex,
    Grid,
    Container,
    Section,
    Tooltip,
    Progress,
    Switch,
    Checkbox,
    Slider,
    Tabs,
    ScrollArea,
    Select,
    MainLayout,
    TopBar,
    Sidebar,
    TitleAndSubtitle,
    VirtualTable,
    KeyboardDateInput,
    DateRangePicker,
    CategorySelector,
    Dialog,
    tokens,
    MainTheme,
    createChannel,
    useChannel,
    layoutChannel,
}
