import { mainArea, mainGrid, sidebarArea, topBarArea } from './MainLayout.css.js'
import { Sidebar } from './Sidebar.jsx'
import { TopBar } from './TopBar.jsx'

/**
 * MainLayout provides the main layout structure for the application
 *
 * @sig MainLayout :: ({ children: ReactNode }) -> ReactElement
 */
const MainLayout = ({ children }) => (
    <div className={mainGrid}>
        <div className={topBarArea}>
            <TopBar />
        </div>
        <div className={sidebarArea}>
            <Sidebar />
        </div>
        <div className={mainArea}>{children}</div>
    </div>
)

export { MainLayout }
