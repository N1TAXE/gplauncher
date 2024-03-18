import React, { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    name?: string;
    button?: string;
    directory?: string;
    webkitdirectory?: string;
}
export const Input = ({children, label, name, ...rest} : InputProps): React.ReactElement => {
    return (
        <div className={`inputItem ${rest.className}`}>
            {label && name && <label htmlFor={name}>{label}</label>}
            <div className={`inputWrapper ${children ? 'inputWrapperDouble' : null}`}>
                <input
                    {...rest}
                    name={name}
                    placeholder={rest.placeholder ? rest.placeholder : label}
                    value={rest.directory ? rest.directory : rest.value}
                />
                {children}
            </div>
        </div>
    )
}
