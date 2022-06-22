import { Express, NextFunction, Request, Response } from 'express'

import * as AccountController from '../controllers/account.controller'
import { HttpNotFound } from '../utils/errors.util'

const index = (app: Express) => {
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader(
            'Access-Control-Allow-Methods',
            'GET, POST, OPTIONS, PUT, PATCH, DELETE'
        )
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-Requested-With, content-type, x-access-token, authorization'
        )
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.removeHeader('X-Powered-By')
        next()
    })

    app.get('/v1/list', AccountController.fetchAll)
    app.get('/v1/search', AccountController.searchByContent)
    app.post('/v1/mints', AccountController.fetchByMint)

    app.use(function (req: Request, res: Response, next: NextFunction) {
        return next(new HttpNotFound())
    })
}

export default index
