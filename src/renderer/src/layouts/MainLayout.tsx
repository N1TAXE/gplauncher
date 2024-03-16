import React from "react";
import { NavLink } from 'react-router-dom'
import { SETTINGS_ROUTE } from '../utils/consts'
function MainLayout({children}: { children: React.ReactElement }): React.ReactElement {
    const handleClose = (): void => window.electron.ipcRenderer.send('app:close')
    const handleMinimize = (): void => window.electron.ipcRenderer.send('app:minimize')
    return (
        <React.Fragment>
            <div className="topbar">
                GPLauncher
                <div className="topbar-btns">
                    <NavLink to={SETTINGS_ROUTE} className="topbar-button">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.0535 0.787789C6.7439 -0.262597 5.2561 -0.262596 4.9465 0.78779L4.87142 1.04252C4.6736 1.71368 3.90701 2.03121 3.29256 1.69651L3.05935 1.56948C2.09769 1.04566 1.04566 2.09769 1.56948 3.05935L1.69651 3.29256C2.03121 3.90702 1.71367 4.6736 1.04252 4.87142L0.78779 4.9465C-0.262597 5.2561 -0.262596 6.7439 0.78779 7.0535L1.04252 7.12858C1.71368 7.3264 2.03121 8.09299 1.69651 8.70744L1.56948 8.94065C1.04566 9.90231 2.09769 10.9543 3.05935 10.4305L3.29256 10.3035C3.90702 9.9688 4.6736 10.2863 4.87142 10.9575L4.9465 11.2122C5.2561 12.2626 6.7439 12.2626 7.0535 11.2122L7.12858 10.9575C7.3264 10.2863 8.09299 9.9688 8.70744 10.3035L8.94065 10.4305C9.90231 10.9543 10.9543 9.90231 10.4305 8.94065L10.3035 8.70744C9.9688 8.09299 10.2863 7.3264 10.9575 7.12858L11.2122 7.0535C12.2626 6.7439 12.2626 5.2561 11.2122 4.9465L10.9575 4.87142C10.2863 4.6736 9.9688 3.90702 10.3035 3.29256L10.4305 3.05935C10.9543 2.09769 9.90231 1.04566 8.94065 1.56948L8.70744 1.69651C8.09299 2.03121 7.3264 1.71367 7.12858 1.04252L7.0535 0.787789ZM6 8.19661C4.78685 8.19661 3.80339 7.21315 3.80339 6C3.80339 4.78685 4.78685 3.80339 6 3.80339C7.21315 3.80339 8.19661 4.78685 8.19661 6C8.19661 7.21315 7.21315 8.19661 6 8.19661Z" fill="inherit"/>
                        </svg>
                    </NavLink>
                    <button onClick={handleMinimize} className="topbar-button">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 5C9.55228 5 10 5.44772 10 6C10 6.55228 9.55228 7 9 7H3C2.44772 7 2 6.55228 2 6C2 5.44772 2.44772 5 3 5H9Z" fill="inherit"/>
                        </svg>
                    </button>
                    <button onClick={handleClose} className="topbar-button">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.16737 2.16737C2.39052 1.94421 2.75233 1.94421 2.97549 2.16737L6 5.19188L9.02451 2.16737C9.24767 1.94421 9.60948 1.94421 9.83263 2.16737C10.0558 2.39052 10.0558 2.75233 9.83263 2.97549L6.80812 6L9.83263 9.02451C10.0558 9.24767 10.0558 9.60948 9.83263 9.83263C9.60948 10.0558 9.24767 10.0558 9.02451 9.83263L6 6.80812L2.97549 9.83263C2.75233 10.0558 2.39052 10.0558 2.16737 9.83263C1.94421 9.60948 1.94421 9.24767 2.16737 9.02451L5.19188 6L2.16737 2.97549C1.94421 2.75233 1.94421 2.39052 2.16737 2.16737Z" fill="inherit"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="content">
                {children}
            </div>
        </React.Fragment>
    )
}

export default MainLayout
