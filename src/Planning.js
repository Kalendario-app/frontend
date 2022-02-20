import React from "react";
import { useState } from "react";
import { EventDetail } from "./EventDetail";
import { useDrag } from "react-dnd";

export const Planning = (props) => {
    const [, setHeight] = useState(window.innerHeight);

    const monthConv = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayConv = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
    };

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

    let stockageTest = [
        ["January 2022", ["Monday 18", [props.eventList[0], props.eventList[1]]]],
        ["February 2022", ["Monday 18", [props.eventList[0]]]],
    ];

    let stockage = [];

    let oldM = null;
    let oldD = null;
    for (let i = 0; i < events.length; i++) {
        let m = new Date(events[i]["start_date"] * 1000).getMonth();
        let d = new Date(events[i]["start_date"] * 1000).getDate();
        if (oldM === m && oldD === d) {
            stockage[stockage.length - 1][stockage[stockage.length - 1].length - 1][1].push(events[i]);
        } else if (oldM === m) {
            stockage[stockage.length - 1].push([
                dayConv[new Date(events[i]["start_date"] * 1000).getDay()] + " " + new Date(events[i]["start_date"] * 1000).getDate(),
                [events[i]],
            ]);
        } else {
            stockage.push([
                monthConv[m] + " " + new Date(events[i]["start_date"] * 1000).getFullYear(),
                [dayConv[new Date(events[i]["start_date"] * 1000).getDay()] + " " + new Date(events[i]["start_date"] * 1000).getDate(), [events[i]]],
            ]);
        }
        oldM = m;
        oldD = d;
    }

    return (
        <div style={{ height: height }} className="planning">
            {stockage.map((x) => (
                <>
                    <h2>{x[0]}</h2>
                    {x.slice(1).map((y) => (
                        <>
                            <h3>{y[0]}</h3>
                            {y[1].map((z) => (
                                <PlanningItem reload={() => props.reload()} event={z} />
                            ))}
                        </>
                    ))}
                </>
            ))}
        </div>
    );
};
