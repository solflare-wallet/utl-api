import { NextFunction, Response, Request } from 'express'
import Joi from 'joi'

import Prisma from '../prisma'

export async function fetchAll(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const tokens = await Prisma.token.findMany({
            include: {
                tags: true,
            },
        })

        return res.send({
            content: tokens.map((token) => {
                return {
                    ...token,
                    tags: token.tags.map((tag) => tag.tag),
                }
            }),
        })
    } catch (error) {
        next(error)
    }
}

export async function fetchByMint(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const tokens = await Prisma.token.findMany({
            where: {
                address: {
                    in: req.body.addresses,
                },
            },
            include: {
                tags: true,
            },
        })

        return res.send({
            content: tokens.map((token) => {
                return {
                    ...token,
                    tags: token.tags.map((tag) => tag.tag),
                }
            }),
        })
    } catch (error) {
        next(error)
    }
}

export async function searchByContent(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const data = await Joi.object({
            query: Joi.string().required(),
            limit: Joi.number().integer().min(1).required(),
        }).validateAsync(req.query)

        const tokens = await Prisma.token.findMany({
            include: {
                tags: true,
            },
            where: {
                OR: [
                    {
                        name: {
                            contains: data.query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        symbol: {
                            contains: data.query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            take: data.limit ?? 1,
            orderBy: {
                holders: 'desc',
            },
        })

        return res.send({
            content: tokens.map((token) => {
                return {
                    ...token,
                    tags: token.tags.map((tag) => tag.tag),
                }
            }),
        })
    } catch (error) {
        next(error)
    }
}
