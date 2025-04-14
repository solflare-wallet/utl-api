import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config()

import ApiSetup from './api/setup'

mongoose
  .connect(process.env.DB_URL as string)
  .then((db) => {
    console.log(`Connected to ${db.connections[0].name} - mongodb`)
    ApiSetup.listen(process.env.PORT ?? 80, () => {
      console.log(`Express running on port ${process.env.PORT}`)
    })
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
