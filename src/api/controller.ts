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
            verified: true,
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

        // Special case if only "+" is passed as query than act like its search all
        const tokens =
            data.query && data.query.length === 1 && data.query === ' '
                ? await TokenModel.find({
                      ...(data.chainId ? { chainId: data.chainId } : {}),
                  })
                      .sort({
                          verified: -1,
                          holders: -1,
                      })
                      .skip(data.start)
                      .limit(data.limit)
                : await TokenModel.find(
                      {
                          ...(data.chainId ? { chainId: data.chainId } : {}),
                          $or: [
                              {
                                  $text: {
                                      $search: escapeRegex(data.query.trim()),
                                  },
                              },
                              {
                                  address: escapeRegex(data.query.trim()),
                              },
                          ],
                      },
                      { score: { $meta: 'textScore' } }
                  )
                      .sort({
                          verified: -1,
                          score: { $meta: 'textScore' },
                          holders: -1,
                      })
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
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')
}
