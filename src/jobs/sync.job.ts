import axios from 'axios'
import { CronJob } from 'cron'
import _ from 'lodash'
import mongoose from 'mongoose'

import TokenModel from '../models/token.model'
import LoggerUtil from '../utils/logger.util'


export interface Token {
    address: string
    name: string
    symbol: string
    logoURI: string | null
    chainId: number
    decimals: number
    holders: number | null
    verified: boolean
    tags: string[]
    extensions: object
}

let jobRunning: null|number = null;

async function handle() {
    LoggerUtil.info(`${name} | Start ${Date.now()}`)

    const cdnUrl = process.env.CDN_URL
    if (!cdnUrl) {
        LoggerUtil.info(`${name} | No CDN URL provided`)
        throw new Error('No CDN URL provided')
    }

    const response = await axios.get<{
        tokens: Token[]
    }>(cdnUrl)

    const newTokens = response.data.tokens.filter((token) => {
        return token.address && token.chainId && token.name && token.symbol && token.decimals
    })

    const currentTokens = await TokenModel.find({})

    LoggerUtil.info(
        `${name} | New count: ${newTokens.length} | Current count: ${currentTokens.length}`
    )

    const newMints = newTokens.map(
        (token) => `${token.address}:${token.chainId}`
    )
    const currentMints = currentTokens.map(
        (token) => `${token.address}:${token.chainId}`
    )

    const deleteTokens = currentTokens.filter((token) => {
        return !newMints.includes(`${token.address}:${token.chainId}`)
    })

    const updateTokens = currentTokens.filter((token) => {
        return newMints.includes(`${token.address}:${token.chainId}`)
    })

    const insertTokens = newTokens.filter((token) => {
        return !currentMints.includes(`${token.address}:${token.chainId}`)
    })

    LoggerUtil.info(
        `${name} | TO BE Deleted: ${deleteTokens.length} | Updated: ${updateTokens.length} | Created: ${insertTokens.length}`
    )

    if (process.env.SYNC_SAVE !== '1') {
        LoggerUtil.info(`${name} | Aborted`)
        return
    }


    let session = await mongoose.connection.startSession()
    try {
        session.startTransaction()

        await TokenModel.deleteMany(
            { _id: { $in: deleteTokens.map((token) => token._id) } },
            { session }
        )
        await session.commitTransaction()
    }
    catch (error: any) {
        await session.abortTransaction()
        LoggerUtil.info(`${name} | error deleting from db ${error.message}`)
        return;
    } finally {
        await session.endSession()
    }


    const insertTokensBatches = _.chunk(insertTokens, 4000);
    for (const insertTokensBatch of insertTokensBatches) {
        session = await mongoose.connection.startSession()
        try {
            session.startTransaction()


            for (const token of insertTokensBatch) {
                await TokenModel.create(
                    [
                        {
                            address: token.address,
                            name: token.name,
                            symbol: token.symbol,
                            decimals: token.decimals,
                            chainId: token.chainId,
                            verified: token.verified,
                            logoURI: token.logoURI ?? null,
                            holders: token.holders,
                            tags: token.tags,
                            extensions: token.extensions,
                        },
                    ],
                    { session }
                )
            }


            await session.commitTransaction()
        } catch (error: any) {
            await session.abortTransaction()
            LoggerUtil.info(`${name} | error inserting to db ${error.message}`)
            break;
        } finally {
            await session.endSession()
        }
    }

    const updateTokensBatches = _.chunk(updateTokens, 4000);
    for (const updateTokensBatch of updateTokensBatches) {
        session = await mongoose.connection.startSession()
        try {
            session.startTransaction()

            for (const token of updateTokensBatch) {
                const newToken = newTokens.find(
                    (t) =>
                        t.address === token.address && t.chainId === token.chainId
                )

                if (!newToken) {
                    LoggerUtil.info(
                        `${name} | Couldnt find new token from current: ${token.address}`
                    )
                    continue
                }

                await TokenModel.updateOne(
                    {
                        address: token.address,
                        chainId: token.chainId,
                    },
                    {
                        $set: {
                            name: newToken.name,
                            symbol: newToken.symbol,
                            decimals: newToken.decimals,
                            verified: newToken.verified,
                            logoURI: newToken.logoURI ?? null,
                            holders: newToken.holders,
                            tags: newToken.tags,
                            extensions: newToken.extensions,
                        },
                    },
                    { session }
                )
            }
            await session.commitTransaction()
        } catch (error: any) {
            await session.abortTransaction()
            LoggerUtil.info(`${name} | error updating to db ${error.message}`)
            break;
        } finally {
            await session.endSession()
        }
    }

    LoggerUtil.info(
        `${name} | Deleted: ${deleteTokens.length} | Updated: ${updateTokens.length} | Created: ${insertTokens.length}`
    )
}

/* istanbul ignore next */
export const cronJob = () =>
    new CronJob(
        process.env.CRON_SYNC ?? '0 * * * * *',
        async () => {
            if (jobRunning) {
                LoggerUtil.info(`${name} | Skip already running from ${jobRunning}`)
                return
            }
            jobRunning = Date.now();
            try {
                await handle() // 30 days
            } catch (error: any) {
                LoggerUtil.info(`${name} | Failed: ${error.message}`)
            } finally {
                jobRunning = null
            }

        },
        null,
        true,
        'UTC'
    )

export const name = 'utl-api-cron-sync'
