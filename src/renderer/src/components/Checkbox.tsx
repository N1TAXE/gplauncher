import React, { ChangeEventHandler, InputHTMLAttributes } from 'react'
type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
    checked: boolean;
    onChange: ChangeEventHandler<HTMLInputElement>;
    name: string;
}
const Checkbox = ({children, checked, onChange, name}: CheckboxProps): React.ReactElement => {
    return (
        <label>
            <div className="check">
                <div className='checkBox'>
                    <input checked={checked} onChange={onChange} name={name} type='checkbox' />
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4.00001L4.09854 7L9 1" stroke="white"/>
                    </svg>
                </div>
                {children}
            </div>
        </label>
    )
}

export default Checkbox
