import cors from 'cors'
import express from 'express'

import errorMiddleware from './errorMiddleware'
import routes from './routes'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

routes(app)

app.use(errorMiddleware)

export default app
