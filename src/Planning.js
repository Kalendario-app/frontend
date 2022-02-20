import React from "react";
import { useState } from "react";
import { EventDetail } from "./EventDetail";
import { useDrag } from "react-dnd";

export const Planning = (props) => {
    const [, setHeight] = useState(window.innerHeight);

    const monthConv = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

    const PlanningItem = (props) => {
        // eslint-disable-next-line
        const [{ isDragging }, drag] = useDrag(() => ({
            type: "monthly-event",
            item: {
                key: props.event["key"],
            },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }), // collect is called whenever the drag starts or stops
        }));

        const [isDetail, setIsDetail] = useState(false);

        let now = new Date();

        function dateToTxt(nbr) {
            let date = new Date(nbr * 1000);
            let hour = date.getHours();
            let minute = date.getMinutes();
            if (hour < 10) {
                hour = "0" + hour;
            }
            if (minute < 10) {
                minute = "0" + minute;
            }
            return hour + "h" + minute;
        }

        return (
            <>
                {isDetail ? (
                    <EventDetail
                        event={props.event}
                        reload={() => props.reload()}
                        closeDetail={() => {
                            setIsDetail(false);
                        }}
                    />
                ) : null}
                <div className="planning-item monthly-item" ref={drag} onClick={(e) => setIsDetail(true)} style={{ backgroundColor: props.event["color"] }}>
                    <p className="planning-name">{props.event["event_name"]}</p>
                    <p className="planning-date">{dateToTxt(props.event["start_date"])}</p>
                </div>
            </>
        );
    };

    let events = props.eventList.filter((e) => {
        if (e["start_date"] > new Date().getTime() / 1000) {
            return true;
        }
        return false;
    });
    events = events.sort((a, b) => {
        return a["start_date"] - b["start_date"];
    });

    return (
        <div style={{ height: height }} className="planning">
            <h2>March 2022</h2>
            <h3>Monday 18</h3>
            <PlanningItem reload={() => props.reload()} event={props.eventList[0]} />
        </div>
    );
};
