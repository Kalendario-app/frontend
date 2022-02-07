import React, { useState } from 'react'

export const Checkbox = (props) => {

    const [nbrReload, reload] = useState(0)
    var isChecked = props.checked

    function handleClick() {
        isChecked = isChecked ? false : true
        props.changement(isChecked)
        reload(nbrReload + 1)
    }

    return (
        <label onMouseDown={() => handleClick()} className='check-container'>{props.txt}
            <input type='checkbox' checked={isChecked} onChange={() => (null)}></input>
            <span className='checkmark' style={{ borderColor: props.color, backgroundColor: isChecked ? props.color : '#EEF2F6' }}></span>
        </label>
    )
}
