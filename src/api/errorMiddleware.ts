import { NextFunction, Request, Response } from 'express'
import { ValidationError } from 'joi'

import {
    HttpError,
    HttpInternalServerError,
    HttpValidationError,
} from '../utils/errors.util'
import LoggerUtil from '../utils/logger.util'

async function handler(
    error: Error,
    req: Request,
    res: Response,
    Next: NextFunction
) {
    console.log('CAPTURE ERROR')
    let stackTrace = undefined

    if (!['production', 'prod'].includes(process.env.NODE_ENV as string)) {
        stackTrace = error.stack
    }

    if (error instanceof ValidationError) {
        error = new HttpValidationError(
            error.details[0].message,
            error.details[0]
        )
    }

    if (!(error instanceof HttpError)) {
        LoggerUtil.error(error)
        error = new HttpInternalServerError()
    }

    if (error instanceof HttpError) {
        res.status(error.statusCode).json({
            type: error.constructor.name,
            message: error.message,
            code: error.statusCode,
            data: error.data ? error.data : {},
            stackTrace,
        })
    } else {
        res.status(500).json({})
    }
}

export default handler
