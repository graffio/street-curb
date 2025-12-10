// ABOUTME: Button that opens a native file picker dialog
// ABOUTME: Wraps a hidden file input with Button styling from Radix

import { Button } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import { useRef } from 'react'

const FilePickerButton = ({ accept, onFileSelect, children, ...buttonProps }) => {
    const inputRef = useRef(null)

    const handleClick = () => inputRef.current?.click()

    const handleChange = event => {
        const file = event.target.files?.[0]
        if (file) {
            onFileSelect(file)
            // Reset input so same file can be selected again
            event.target.value = ''
        }
    }

    return (
        <>
            <input ref={inputRef} type="file" accept={accept} onChange={handleChange} style={{ display: 'none' }} />
            <Button type="button" onClick={handleClick} {...buttonProps}>
                {children}
            </Button>
        </>
    )
}

FilePickerButton.propTypes = {
    accept: PropTypes.string,
    onFileSelect: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
}

export { FilePickerButton }
