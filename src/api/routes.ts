import { Express, NextFunction, Request, Response } from 'express'

import { HttpNotFound } from '../utils/errors.util'

import * as Controller from './controller'

const routes = (app: Express) => {
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

    app.get('/v1/list', Controller.fetchAll)
    app.get('/v1/search', Controller.searchByContent)
    app.post('/v1/mints', Controller.fetchByMint)

    app.use(function (req: Request, res: Response, next: NextFunction) {
        return next(new HttpNotFound())
    })
}

export default routes
