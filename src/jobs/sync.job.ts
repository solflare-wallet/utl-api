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

    const newMints = newTokens.map((token) => token.address)
    const currentMints = currentTokens.map((token) => token.address)

    const deleteMints = currentMints.filter((mint) => {
        return !newMints.includes(mint)
    })

    const updateTokens = currentTokens.filter((token) => {
        return newMints.includes(token.address)
    })

    const insertTokens = newTokens.filter((token) => {
        return !currentMints.includes(token.address)
    })

    const session = await mongoose.connection.startSession()
    try {
        session.startTransaction()
        const transactions: mongoose.Query<any, any>[] = []

        await TokenModel.deleteMany(
            { address: { $in: deleteMints } },
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
            const newToken = newTokens.find((t) => t.address === token.address)

            if (!newToken) {
                LoggerUtil.info(
                    `${name} | Couldnt find new token from current: ${token.address}`
                )
                continue
            }

            transactions.push(
                TokenModel.updateOne(
                    {
                        address: token.address,
                    },
                    {
                        $set: {
                            name: newToken.name,
                            symbol: newToken.symbol,
                            decimals: newToken.decimals,
                            chainId: newToken.chainId,
                            verified: newToken.verified,
                            logoURI: newToken.logoURI ?? null,
                            holders: newToken.holders,
                            tags: newToken.tags,
                        },
                    },
                    { session }
                )
            )
        }
        await session.commitTransaction()
        LoggerUtil.info(
            `${name} | Deleted: ${deleteMints.length} | Updated: ${updateTokens.length} | Created: ${insertTokens.length}`
        )
    } catch (error: any) {
        await session.abortTransaction()
        LoggerUtil.info(`${name} | error saving to db ${error.message}`)
    } finally {
        session.endSession()
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
