import mongoose from 'mongoose'

export interface IToken extends mongoose.Document {
    address: string
    chainId: number
    name: string
    symbol: string
    verified: boolean
    decimals: number
    holders: number | null
    logoURI: string | null
    tags: string[]
}

export const TokenSchema = new mongoose.Schema<IToken>(
    {
        address: {
            type: String,
            required: true,
        },
        chainId: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        symbol: {
            type: String,
            required: true,
        },
        verified: {
            type: Boolean,
            required: true,
        },
        decimals: {
            type: Number,
            required: true,
        },
        holders: {
            type: Number,
            default: null,
        },
        logoURI: {
            type: String,
            default: null,
        },
        tags: {
            type: [String],
            required: true,
            default: [],
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret, options) {
                delete ret._id
                delete ret.__v
                return ret
            },
        },
    }
)

TokenSchema.index({ address: 1, chainId: 1 }, { unique: true })
TokenSchema.index({ name: 1 }, { collation: { locale: 'en', strength: 1 } })
TokenSchema.index({ symbol: 1 }, { collation: { locale: 'en', strength: 1 } })
TokenSchema.index({ chainId: 1 })
TokenSchema.index({ holders: -1 })
TokenSchema.index({ tags: 1 })

const TokenModel = mongoose.model('token', TokenSchema)
export default TokenModel
