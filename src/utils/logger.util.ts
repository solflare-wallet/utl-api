import { LoggingWinston } from '@google-cloud/logging-winston'
import winston from 'winston'

const transports = []

if (process.env.GCP_PROJECT) {
    /* istanbul ignore next */
    transports.push(new LoggingWinston())
} else {
    transports.push(new winston.transports.Console())
}

export const Logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports,
    silent: process.env.JEST_WORKER_ID !== undefined,
})

export default Logger
