import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'

import * as SyncJob from './jobs/sync.job'
import * as OsReportUtil from './utils/osReport.util'

dotenv.config()

setInterval(OsReportUtil.task('utl-api-cron'), OsReportUtil.interval)

mongoose
  .connect(process.env.DB_URL as string)
  .then((db) => {
    console.log(`Connected to ${db.connections[0].name} - mongodb`)
    SyncJob.cronJob().start()
  })
  .catch((error) => {
    console.log('There was an error connecting to db')
    console.log(error)
  })

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected!');
});

process.on('SIGTERM', () => {
  mongoose.disconnect().then(() => {
    console.log('Mongoose disconnected!');
  });
});
