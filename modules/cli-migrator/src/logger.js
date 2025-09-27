let logger = null // singleton

// prettier-ignore
const createLogger = (level = 'log') => {
    
    const config = {
        debug  : { priority: 0, prefix: '', consoleF: console.debug },
        info   : { priority: 1, prefix: '', consoleF: console.info  },
        log    : { priority: 2, prefix: '', consoleF: console.log   },
        warning: { priority: 3, prefix: '', consoleF: console.warn  },
        error  : { priority: 4, prefix: '', consoleF: console.error },
    }
    
    const minimumPriority = config[level].priority

    const _log = level => (message = '') => {
        const { priority, prefix, consoleF } = config[level]
        if (priority >= minimumPriority) consoleF(`${prefix}${message}`)
    }

    logger = {
        debug  : _log('debug'),
        info   : _log('info'),
        log    : _log('log'),
        warning: _log('warning'),
        error  : _log('error'),
        
        exec   : _log('info'), // Keep exec for backward compatibility
    }
    
    return logger
}

const getLogger = () => {
    if (!logger) throw new Error('Logger not initialized. Call createLogger() first.')
    return logger
}

export { createLogger, getLogger }
