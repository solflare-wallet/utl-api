import { NextFunction, Response, Request } from 'express'
import Joi from 'joi'

import TokenModel from '../models/token.model'

export async function fetchAll(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const query = await Joi.object({
            chainId: Joi.number().integer().valid(101, 102, 103),
        }).validateAsync(req.query)

        const tokens = await TokenModel.find({
            ...(query.chainId ? { chainId: query.chainId } : {}),
        })

        return res.send({
            content: tokens,
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
        const body = await Joi.object({
            addresses: Joi.array().items(Joi.string()).min(1).required(),
        }).validateAsync(req.body)

        const query = await Joi.object({
            chainId: Joi.number().integer().valid(101, 102, 103),
        }).validateAsync(req.query)

        const tokens = await TokenModel.find({
            address: {
                $in: body.addresses,
            },
            ...(query.chainId ? { chainId: query.chainId } : {}),
        }).exec()

        return res.send({
            content: tokens,
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
            start: Joi.number().integer().min(0).required(),
            limit: Joi.number().integer().min(1).required(),
            chainId: Joi.number().integer().valid(101, 102, 103),
        }).validateAsync(req.query)

        const tokens = await TokenModel.find({
            ...(data.chainId ? { chainId: data.chainId } : {}),
            $or: [
                {
                    name: {
                        $regex: escapeRegex(data.query),
                        $options: 'i',
                    },
                },
                {
                    symbol: {
                        $regex: escapeRegex(data.query),
                        $options: 'i',
                    },
                },
                {
                    address: data.query,
                },
            ],
        })
            .sort({ holders: -1 })
            .skip(data.start)
            .limit(data.limit)

        return res.send({
            content: tokens,
        })
    } catch (error) {
        next(error)
    }
}

function escapeRegex(string: string) {
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}