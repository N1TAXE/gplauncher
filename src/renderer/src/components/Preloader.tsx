import React from 'react'
import { TailSpin } from 'react-loader-spinner'

const Preloader = ({children}: { children?: React.ReactNode }): React.ReactElement => {
    return (
        <div className="loader">
            <div className='loaderWrapper'>
                <TailSpin
                    visible={true}
                    height="156"
                    width="156"
                    color="#74D372"
                    ariaLabel="tail-spin-loading"
                    radius="1"
                    strokeWidth={3}
                />
                <span>
                    {children}
                </span>
            </div>
        </div>
    )
}

export default Preloader
