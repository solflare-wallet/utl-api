export const codes = {
    UNAUTHORIZED: 401,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
}

export class HttpError extends Error {
    name: string
    statusCode: number
    data: unknown

    constructor(
        message: string,
        name: string | null,
        statusCode: number,
        data: unknown
    ) {
        super(message)
        this.name = name ?? this.constructor.name
        this.statusCode = statusCode
        this.data = data
        Error.captureStackTrace(this, HttpError)
    }
}

export class HttpTooManyRequests extends HttpError {
    constructor(message: string | null = null, data: unknown = null) {
        super(
            message ?? 'Too Many Requests',
            null,
            codes.TOO_MANY_REQUESTS,
            data ?? {}
        )
    }
}

export class HttpUnauthorized extends HttpError {
    constructor(message: string | null = null, data: unknown = null) {
        super(message ?? 'Unauthorized', null, codes.UNAUTHORIZED, data ?? {})
    }
}

export class HttpBadRequest extends HttpError {
    constructor(message: string | null = null, data: unknown = null) {
        super(message ?? 'Bad request', null, codes.BAD_REQUEST, data ?? {})
    }
}

export class HttpValidationError extends HttpError {
    constructor(message: string | null = null, data: unknown = null) {
        super(
            message ?? 'Validation error',
            null,
            codes.BAD_REQUEST,
            data ?? {}
        )
    }
}

export class HttpNotFound extends HttpError {
    constructor(message: string | null = null, data: unknown = null) {
        super(message ?? 'Not Found', null, codes.NOT_FOUND, data ?? {})
    }
}

/* istanbul ignore next */
export class HttpInternalServerError extends HttpError {
    constructor(message: string | null = null, data: unknown = null) {
        super(
            message ?? 'Internal server error',
            null,
            codes.INTERNAL_SERVER_ERROR,
            data ?? {}
        )
    }
}

export default {
    codes,
    HttpUnauthorized,
    HttpError,
    HttpBadRequest,
    HttpValidationError,
    HttpNotFound,
    HttpInternalServerError,
    HttpTooManyRequests,
}
