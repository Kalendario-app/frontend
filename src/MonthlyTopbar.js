import React from "react";
import { useDrag } from "react-dnd";

export const MonthlyTopbar = (props) => {
    // eslint-disable-next-line
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "add",
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }), // collect is called whenever the drag starts or stops
    }));

    function monthString(nbr) {
        var months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        return months[nbr - 1] || "";
    }

    return (
        <div className='monthly-topbar'>
            <div className='monthly-nav'>
                <h2>
                    {monthString(props.month)} {props.year}
                </h2>
                <p className='monthly-prev' onClick={() => props.prevMonth()}>
                    &#60;
                </p>
                <p className='monthly-next' onClick={() => props.nextMonth()}>
                    &#62;
                </p>
                {window.matchMedia("(max-width: 450px)").matches ? null : (
                    <div className='select-wrapper cal-type-switch'>
                        {" "}
                        <select
                            onChange={(e) => {
                                if (e.target.value === "weekly") {
                                    props.switch();
                                }
                            }}
                            className='cal-type-switch-in'>
                            <option value='monthly'>Monthly</option>
                            <option value='weekly'>Weekly</option>
                        </select>
                    </div>
                )}
            </div>
            <div className='monthly-top-button cta-button'>
                <button
                    ref={drag}
                    className='button-full'
                    onClick={() => {
                        props.add();
                    }}>
                    <span className='plus-add'>+</span>
                    {window.matchMedia("(max-width: 450px)").matches
                        ? null
                        : "New"}
                </button>
            </div>
        </div>
    );
};
//todo remettre le switch monthly-weekly pour le mobile
/*{window.matchMedia("(max-width: 450px)").matches ? (
    <div className='select-wrapper cal-type-switch'>
    {" "}
    <select
        onChange={(e) => {
            if (e.target.value === "weekly") {
                props.switch();
            }
        }}
        className='cal-type-switch-in'>
        <option value='monthly'>Monthly</option>
        <option value='weekly'>Weekly</option>
    </select>
</div>
) : null}*/
