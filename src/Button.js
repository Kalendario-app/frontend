import React from "react";

export const Button = (props, { onClick }) => {
    var classNom = "";

    if (props.full) {
        classNom = classNom.concat("button-full");
    } else {
        classNom = classNom.concat("button-empty");
    }
    if (props.last) {
        classNom = classNom.concat(" last-button");
    } else if (props.first) {
        classNom = classNom.concat(" first-button");
    }

    return (
        <button
            className={classNom}
            onClick={() => {
                props.onClick();
            }}
            style={{ backgroundColor: props.color, borderColor: props.color }}>
            {props.txt}
        </button>
    );
};
