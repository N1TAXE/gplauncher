import axios from 'axios'
import { ModTypes, SearchArgs } from '../../../types'

const api = 'https://api.modrinth.com/v2'

const $modrinth = axios.create({
    baseURL: `${api}`,
})

export const fetchMods = async (args?: SearchArgs): Promise<ModTypes[]> => {
    const {data} = await $modrinth.get('search', { params: args })
    return data.hits;
}

export const fetchOneMod = async (slug: string): Promise<ModTypes[]> => {
    const {data} = await $modrinth.get(`project/${slug}`)
    return data.hits;
}
