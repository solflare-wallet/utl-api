import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

import { Token } from './jobs/sync.job'

async function getTokensFromUrl(url: string) {
    const { data } = await axios.get<{
        tokens: Token[]
    }>(url)

    return data.tokens
}

async function compare() {
    const currentTokens = await getTokensFromUrl(process.env.CDN_URL as string)
    const futureTokens = await getTokensFromUrl(
        process.env.FUTURE_CDN_URL as string
    )

    const currentMints = currentTokens.map(
        (token) => `${token.address}:${token.chainId}`
    )

    const futureMints = futureTokens.map(
        (token) => `${token.address}:${token.chainId}`
    )

    const deleteTokens = currentMints.filter((tokenMint) => {
        return !futureMints.includes(tokenMint)
    })

    const updateTokens = currentMints.filter((tokenMint) => {
        return futureMints.includes(tokenMint)
    })

    const insertTokens = currentMints.filter((tokenMint) => {
        return !currentMints.includes(tokenMint)
    })

    for (const deletedToken of deleteTokens) {
        console.log(deletedToken)
    }

    console.log(
        `Deleting ${deleteTokens.length} | Insert ${insertTokens.length} | Keep: ${updateTokens.length}`
    )
}

compare()
