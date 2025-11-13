// ABOUTME: Storybook stories for LoadingSpinner component
// ABOUTME: Demonstrates loading states for Suspense boundaries

import { LoadingSpinner } from '../src/index.js'

export default { title: 'LoadingSpinner', component: LoadingSpinner }

export const Default = () => <LoadingSpinner />

export const InContainer = () => (
    <div style={{ width: '400px', height: '300px', border: '1px solid var(--gray-6)' }}>
        <LoadingSpinner />
    </div>
)
