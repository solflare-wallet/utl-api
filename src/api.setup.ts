import cors from 'cors'
import express from 'express'

import errorHandler from './middlewares/errorHandler.middleware'
import routes from './routes'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

routes(app)

app.use(errorHandler)

export default app
