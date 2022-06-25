import axios from 'axios'
import { CronJob } from 'cron'
import mongoose from 'mongoose'

import TokenModel from '../models/token.model'
import LoggerUtil from '../utils/logger.util'

interface Token {
    address: string
    name: string
    symbol: string
    logoURI: string | null
    chainId: number
    decimals: number
    holders: number | null
    verified: boolean
    tags: string[]
}

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

    const newTokens = response.data.tokens
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

    const session = await mongoose.connection.startSession()
    try {
        session.startTransaction()

        await TokenModel.deleteMany(
            { _id: { $in: deleteTokens.map((token) => token._id) } },
            { session }
        )

        for (const token of insertTokens) {
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
                    },
                ],
                { session }
            )
        }

        for (const token of updateTokens) {
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
                    },
                },
                { session }
            )
        }
        await session.commitTransaction()
        LoggerUtil.info(
            `${name} | Deleted: ${deleteTokens.length} | Updated: ${updateTokens.length} | Created: ${insertTokens.length}`
        )
    } catch (error: any) {
        await session.abortTransaction()
        LoggerUtil.info(`${name} | error saving to db ${error.message}`)
    } finally {
        await session.endSession()
    }
}

/* istanbul ignore next */
export const cronJob = () =>
    new CronJob(
        '0 * * * * *',
        async () => {
            await handle() // 30 days
        },
        null,
        true,
        'UTC'
    )

export const name = 'utl-api-cron-sync'
