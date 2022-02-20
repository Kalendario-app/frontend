import React from "react";
import { useState } from "react";

export const Planning = () => {
    const [, setHeight] = useState(window.innerHeight);

    const updateWidthAndHeight = () => {
        setHeight(window.innerHeight);
    };
    React.useEffect(() => {
        window.addEventListener("resize", updateWidthAndHeight);
        return () => window.removeEventListener("resize", updateWidthAndHeight);
    });

    let height = document.getElementsByClassName("monthly-calendar")[0];
    if (height === undefined) {
        height = "100%";
    } else {
        height = height.clientHeight + "px";
    }

    return <div style={{ height: height }} className="planning"></div>;
};
