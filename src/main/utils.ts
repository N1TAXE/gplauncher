import { Authenticator, DistTypes, ILauncherOptions } from 'gpl-core'
import { store } from './store'

export async function getOpts(): Promise<[ILauncherOptions, DistTypes] | undefined> {
    const url = 'https://gist.githubusercontent.com/N1TAXE/6384e1f556e3f76241c0b5c02a1fd4cd/raw/manifest.json'
    let dist: DistTypes | undefined
    await fetch(url)
        .then(response => response.json())
        .then(data => {
            dist = data
        });
    if (!dist) return;
    store.set('dist', dist)
    return [{
        authorization: Authenticator.getAuth(store.get('username')),
        root: store.get('gameRoot') || `./minecraft`,
        version: {
            number: dist.version,
            type: "release"
        },
        memory: {
            max: `${store.get('memoryMax')}M` || '6000M',
            min: `${store.get('memoryMin')}M` || '4000M'
        },
        forge: dist.forge,
        overrides: {
            gameDirectory: `${store.get('gameRoot')}/versions/${dist.name}` || `./minecraft/versions/${dist.name}`,
            fw: {
                version: '1.6.0'
            },
            detached: false
        },
        quickPlay: store.get('quickPlay') ? {
            type: 'multiplayer',
            identifier: `${dist.server.address}:${dist.server.port}`
        } : undefined,
        window: {
            width: store.get('windowW'),
            height: store.get('windowH'),
            fullscreen: store.get('fullscreen')
        }
    }, dist]
}
