import { PrismaPromise } from '@prisma/client'
import dotenv from 'dotenv'
import _ from 'lodash'

import tokenListJson from '../solana-tokenlist.json'

import Prisma from './prisma'

// import axios from 'axios'

dotenv.config()

Prisma.$connect()
    .then(async () => {
        console.log(`Connected to db`)
        syncTokenList().then(() => {
            console.log('Token list synced')
        })
    })
    .catch((error: any) => {
        console.log('There was an error connecting to db')
        console.log(error)
    })

async function syncTokenList() {
    // const response = tokenListJson

    const newTokens = tokenListJson.tokens
    const currentTokens = await Prisma.token.findMany()

    console.log('newTokens', newTokens.length)
    console.log('currentTokens', currentTokens.length)

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

    console.log('deleteMints', deleteMints.length)
    console.log('updateTokens', updateTokens.length)
    console.log('insertTokens', insertTokens.length)
}
