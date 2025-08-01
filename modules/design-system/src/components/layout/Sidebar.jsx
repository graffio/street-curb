import { Link } from 'react-router-dom'
import { sidebar, section, sectionTitle, nav, navItem, navItemActive } from './Sidebar.css.js'
import { useChannel } from '../../channels/channel.js'
import { layoutChannel } from '../../channels/layout-channel.js'

/**
 * Sidebar component provides navigation for the application
 *
 * @sig Sidebar :: () -> ReactElement
 */
const Sidebar = () => {
    const [sidebarItems] = useChannel(layoutChannel, 'sidebarItems')

    // Default navigation if no items are set
    const defaultItems = [
        {
            title: 'Dashboard',
            items: [
                { href: '/overview', label: 'Overview', active: true },
                { href: '/accounts', label: 'Accounts', active: false },
                { href: '/transactions', label: 'Transactions', active: false },
            ],
        },
        {
            title: 'Reports',
            items: [
                { href: '/income', label: 'Income & Expenses', active: false },
                { href: '/investments', label: 'Investments', active: false },
                { href: '/net-worth', label: 'Net Worth', active: false },
            ],
        },
    ]

    const itemsToRender = sidebarItems.length > 0 ? sidebarItems : defaultItems

    return (
        <nav className={sidebar}>
            {itemsToRender.map((sectionData, index) => (
                <div key={index} className={section}>
                    <h3 className={sectionTitle}>{sectionData.title}</h3>
                    <div className={nav}>
                        {sectionData.items.map((item, itemIndex) => (
                            <Link
                                key={itemIndex}
                                to={item.href}
                                className={`${navItem} ${item.active ? navItemActive : ''}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </nav>
    )
}

export { Sidebar }
