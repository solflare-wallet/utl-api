import dotenv from 'dotenv'
dotenv.config()

import Api from './api.setup'
import Prisma from './prisma'

Prisma.$connect()
    .then(async () => {
        console.log(`Connected to db`)
        Api.listen(process.env.PORT, () => {
            console.log(`Express running on port ${process.env.PORT}`)
        })
    })
    .catch((error: any) => {
        console.log('There was an error connecting to db')
        console.log(error)
    })
