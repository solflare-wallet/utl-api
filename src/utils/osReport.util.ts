import os from 'os'

import LoggerUtil from './logger.util'

export const task = (processName: string) => {
    return () => {
        const memoryRatio =
            Math.round((os.freemem() / os.totalmem()) * 100) / 100
        LoggerUtil.info(`${processName} | os | mem.r: ${memoryRatio}`)
    }
}

export const interval = 5000
