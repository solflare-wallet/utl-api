import Axios, { AxiosError, AxiosRequestConfig } from 'axios'
import _ from 'lodash'

import LoggerUtil from './logger.util'

/* istanbul ignore next */
const SlimAxiosError = (
    error: unknown,
    url: string,
    data: unknown | null = null
) => {
    const slimError = new Error((error as Error).message) as any

    const axios = {
        url,
        data: _.truncate(JSON.stringify(data), {
            length: 1000,
        }),
        response: {},
        request: {},
        meta: {},
    }

    if (error instanceof AxiosError) {
        if (error.response !== undefined) {
            axios.response = {
                status: error.response.status,
                data: _.truncate(JSON.stringify(error.response.data), {
                    length: 1000,
                }),
            }
        }

        if (error.request !== undefined) {
            axios.request = _.pick(error.request, [
                'host',
                'path',
                'method',
                'protocol',
            ])
        }
    }

    slimError.meta = { axios }

    LoggerUtil.error(slimError.message, slimError.meta)
    return slimError
}

/* istanbul ignore next */
export const get = async (url: string, config: AxiosRequestConfig) => {
    try {
        return await Axios.get(url, config)
    } catch (error) {
        throw SlimAxiosError(error, url)
    }
}

/* istanbul ignore next */
export const del = async (url: string, config: AxiosRequestConfig) => {
    try {
        return await Axios.delete(url, config)
    } catch (error) {
        throw SlimAxiosError(error, url)
    }
}

export const post = async (
    url: string,
    data: unknown,
    config: AxiosRequestConfig
) => {
    try {
        return await Axios.post(url, data, config)
    } catch (error) {
        throw SlimAxiosError(error, url, data)
    }
}

/* istanbul ignore next */
export const put = async (
    url: string,
    data: unknown,
    config: AxiosRequestConfig
) => {
    try {
        return await Axios.put(url, data, config)
    } catch (error) {
        throw SlimAxiosError(error, url, data)
    }
}

/* istanbul ignore next */
export const patch = async (
    url: string,
    data: unknown,
    config: AxiosRequestConfig
) => {
    try {
        return await Axios.patch(url, data, config)
    } catch (error) {
        throw SlimAxiosError(error, url, data)
    }
}
