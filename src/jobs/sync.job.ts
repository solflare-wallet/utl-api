import { PrismaPromise } from '@prisma/client'
import axios from 'axios'
import { CronJob } from 'cron'

import Prisma from '../prisma'
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
    const currentTokens = await Prisma.token.findMany()

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

    const transactions: PrismaPromise<any>[] = []

    transactions.push(
        Prisma.token.deleteMany({ where: { address: { in: deleteMints } } })
    )

    for (const token of insertTokens) {
        transactions.push(
            Prisma.token.create({
                data: {
                    address: token.address,
                    name: token.name,
                    symbol: token.symbol,
                    decimals: token.decimals,
                    chainId: token.chainId,
                    verified: token.verified,
                    logoURI: token.logoURI ?? '',
                    holders: token.holders,
                    tags: {
                        create: token.tags.map((tag: string) => {
                            return {
                                tag: tag,
                            }
                        }),
                    },
                },
            })
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
            Prisma.tag.deleteMany({
                where: {
                    address: token.address,
                },
            })
        )
        transactions.push(
            Prisma.token.update({
                where: {
                    address: token.address,
                },
                data: {
                    name: newToken.name,
                    symbol: newToken.symbol,
                    decimals: newToken.decimals,
                    chainId: newToken.chainId,
                    verified: newToken.verified,
                    logoURI: newToken.logoURI ?? '',
                    holders: newToken.holders,
                    tags: {
                        create: newToken.tags.map((tag: string) => {
                            return {
                                tag: tag,
                            }
                        }),
                    },
                },
            })
        )
    }

    await Prisma.$transaction(transactions)

    LoggerUtil.info(
        `${name} | Deleted: ${deleteMints.length} | Updated: ${updateTokens.length} | Created: ${insertTokens.length}`
    )
}

/* istanbul ignore next */
export const cronJob = () =>
    new CronJob(
        '0 */5 * * * *',
        async () => {
            await handle() // 30 days
        },
        null,
        true,
        'UTC'
    )

export const name = 'utl-api-cron-sync'
