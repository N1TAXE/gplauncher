import Store, {Schema} from "electron-store";
import { ServerStoreTypes, StoreTypes } from '../types'
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
    }
};
export const store = new Store({schema: schema});
const serverSchema: Schema<ServerStoreTypes> = {
    version: {
        type: 'string'
    }
};
export const serverStore = new Store({schema: serverSchema});
