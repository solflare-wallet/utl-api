import dotenv from 'dotenv'

import * as SyncJob from './jobs/sync.job'
import Prisma from './prisma'
import * as OsReportUtil from './utils/osReport.util'

dotenv.config()

setInterval(OsReportUtil.task('utl-api-cron'), OsReportUtil.interval)

Prisma.$connect()
    .then(async () => {
        console.log(`Connected to db`)
        SyncJob.cronJob().start()
    })
    .catch((error: any) => {
        console.log('There was an error connecting to db')
        console.log(error)
    })
