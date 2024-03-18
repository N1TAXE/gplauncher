import Store, {Schema} from "electron-store";
import { StoreTypes } from '../types'
import * as os from 'os'
import * as path from 'path'

const appDataRoamingPath = path.join(os.homedir(), 'AppData', 'Roaming', '.gplauncher');

const schema: Schema<StoreTypes> = {
    username: {
        type: 'string'
    },
    dist: {
        type: 'object'
    },
    clientMods: {
        type: 'array'
    },
    gameRoot: {
        type: 'string',
        default: appDataRoamingPath
    },
    memoryMin: {
        type: 'number',
        default: 4000
    },
    memoryMax: {
        type: 'number',
        default: 6000
    },
    quickPlay: {
        type: 'boolean',
        default: false
    },
    fullscreen: {
        type: 'boolean',
        default: false
    },
    windowW: {
        type: 'number',
        default: 856
    },
    windowH: {
        type: 'number',
        default: 482
    },
    lang: {
        type: "string"
    }
};
export const store = new Store({schema: schema});
