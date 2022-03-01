import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { EventDetail } from "./EventDetail";

export const NextEvents = (props) => {
    var filteredList = props.eventList.map((x) => x);
    var now = new Date();

    var nbrDisplay = 6;

    filteredList.sort(function (a, b) {
        return a["start_date"] - b["start_date"];
    });
    filteredList = filteredList.filter((event) => event["start_date"] > now.getTime() / 1000);
    filteredList = filteredList.filter((event) => {
        if (typeof event["display_start"] === "number") {
            return false;
        } else {
            return true;
        }
    });
    if (filteredList.length > 30) {
        filteredList = filteredList.slice(0, nbrDisplay);
    }

    // const dayConv = [
    //     'Sunday',
    //     'Monday',
    //     'Tuesday',
    //     'Wednesday',
    //     'Thursday',
    //     'Friday',
    //     'Saturday',
    // ]
    const monthConv = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December",
    };

    const NextEventItem = (props) => {
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

        function dateToTxt(nbr) {
            let date = new Date(nbr * 1000);
            let dateString = "";
            let durationT = props.event["end_date"] + 1 - props.event["start_date"];
            if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                dateString = dateString.concat("Today");
            } else if (date.getDate() === now.getDate() + 1 && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                dateString = dateString.concat("Tomorrow");
            } else if (date.getDate() === now.getDate() - 1 && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                dateString = dateString.concat("Yesterday");
            } else {
                dateString = dateString.concat(monthConv[date.getMonth() + 1]);
                dateString = dateString.concat(", ");
                dateString = dateString.concat(date.getDate());
                dateString = dateString.concat(" ");
                dateString = dateString.concat(date.getFullYear());
            }
            if (durationT >= 86400) {
            } else {
                dateString = dateString.concat(" at ");
                if (date.getHours() < 10) {
                    dateString = dateString.concat("0");
                }
                dateString = dateString.concat(date.getHours());
                dateString = dateString.concat("h");
                dateString = dateString.concat(date.getMinutes());
                if (date.getMinutes() < 10) {
                    dateString = dateString.concat("0");
                }
            }
            return dateString;
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
                <div className="next-event-item" ref={drag} onClick={(e) => setIsDetail(true)}>
                    <div className="next-event-dot" style={{ backgroundColor: props.event["color"] }}></div>
                    <div className="next-event-text">
                        <p className="next-event-name">{props.event["event_name"]}</p>
                        <p className="next-event-date">{dateToTxt(props.event["start_date"])}</p>
                    </div>
                </div>
            </>
        );
    };

    //todo ajouter une image pour quand ya pas d'évent (peut être mascote ?)

    return (
        <div style={{ height: props.height + "px" }} className="next-event">
            <h2>Prochains évenements</h2>
            {filteredList.length < 1 ? (
                <div className="next-event-error">
                    <p>Il n'y a rien par ici...</p>
                </div>
            ) : null}
            <div className="next-event-container" style={{ height: props.height - 56 + "px" }}>
                {filteredList.map((x, y) => (
                    <NextEventItem key={y} reload={() => props.reload()} event={x} />
                ))}
            </div>
        </div>
    );
};
