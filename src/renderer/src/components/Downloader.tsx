import React from 'react'
const Downloader = (): React.ReactElement => {
    return (
        <div className="downloader" data-pct="100">
            <svg id="svg" width="156" height="156" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <circle r="78" cx="78" cy="78" fill="transparent" strokeDasharray="565.48" strokeDashoffset="0"></circle>
                <circle id="bar" r="78" cx="78" cy="78" fill="transparent" strokeDasharray="565.48" strokeDashoffset="0"></circle>
            </svg>
        </div>
    )
}
export default Downloader
