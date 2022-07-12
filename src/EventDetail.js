import React, { useState } from "react";
import { api } from "./Main";

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
const dayConv = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
};

export const EventDetail = (props) => {
    function deleteEvent() {
        api.get("eventDelete?key=" + props.event["key"]).then((response) => {
            if (response.status === 200) {
                props.closeDetail();
                props.reload();
            }
        });
    }

    console.log(props.event);

    var name = props.event["event_name"];
    var date_debut = "";
    var duration = "";
    var repetition = "";
    var debut = new Date(props.event["start_date"] * 1000);
    var fin = new Date(props.event["end_date"] * 1000);
    var durationT = (fin.getTime() - debut.getTime()) / 1000;
    var debutMo;
    var debutY;
    var debutD;
    var debutH;
    var durationM;
    var durationH;
    var debutM;
    if (durationT >= 86400) {
        debutMo = monthConv[debut.getMonth() + 1];
        debutY = debut.getFullYear();
        debutD = debut.getDate();
        date_debut = debutD + ", " + debutMo + ", " + debutY;
        duration = duration.concat(Math.floor(props.event["end_date"] / 86400) - Math.floor(props.event["start_date"] / 86400) + 1);
        duration = duration + " days";
    } else {
        durationH = Math.floor(durationT / 3600);
        durationM = Math.floor((durationT - 3600 * durationH) / 60);
        if (durationM < 10) {
            durationM = "0" + durationM;
        }
        duration = durationH + "h" + durationM;

        debutMo = monthConv[debut.getMonth() + 1];
        debutY = debut.getFullYear();
        debutD = debut.getDate();
        debutH = debut.getHours();
        debutM = debut.getMinutes();
        if (debutM < 10) {
            debutM = "0" + debutM;
        }
        date_debut = debutD + ", " + debutMo + ", " + debutY + " at " + debutH + "h" + debutM;
    }
    if (props.event["recurence"] !== -1) {
        repetition = "Every ";
        if (props.event["recurence_nbr"] !== 1) {
            repetition = repetition.concat(props.event["recurence_nbr"] + " ");
        }
        switch (props.event["recurence_type"]) {
            case 1:
                repetition = repetition.concat("day");
                break;
            case 2:
                if (props.event["recurence_nbr"] === 1) {
                    repetition = repetition.concat(dayConv[debut.getDay()]);
                } else {
                    repetition = repetition.concat("week");
                }
                break;
            case 3:
                repetition = repetition.concat("month");
                break;
            case 4:
                repetition = repetition.concat("year");
                break;
            default:
                repetition = "";
                break;
        }
        if (props.event["recurenceEndType"] > 0) {
            let date = new Date(props.event["recurenceEndNbr"]);
            repetition = repetition.concat(" until the " + date.getDate() + " " + monthConv[date.getMonth() + 1] + " " + date.getFullYear());
        }
    }

    const [isDropdown, setisDropdown] = useState(false);
    //faire une fonction qui gère l'appuie sur le bouton édit et delete

    return (
        <div
            className="detail-container"
            onClick={(e) => {
                props.closeDetail();
                e.stopPropagation();
            }}>
            <div
                className="event-detail"
                onClick={(e) => {
                    e.stopPropagation();
                    if (isDropdown) {
                        setisDropdown(false);
                    }
                }}>
                <div className="detail-first-line">
                    <i
                        className="fas fa-times"
                        onClick={(e) => {
                            props.closeDetail();
                            e.stopPropagation();
                        }}></i>
                    <h2 style={{ color: props.event["color"] }}>{name}</h2>
                    <i
                        className="fas fa-ellipsis-h"
                        onClick={() => {
                            setisDropdown(isDropdown ? false : true);
                        }}></i>
                </div>
                {isDropdown ? (
                    <div className="detail-dropdown">
                        {props.event["isOwner"] ? (
                            <>
                                <div
                                    onClick={() => {
                                        props.closeDetail();
                                        props.setEdit(props.event);
                                    }}
                                    className="detail-drop-edit">
                                    <i className="fas fa-pen"></i>Edit
                                </div>
                                <div
                                    onClick={() => {
                                        setisDropdown(false);
                                        deleteEvent();
                                    }}
                                    className="detail-drop-delete">
                                    <i className="fas fa-trash"></i>Delete
                                </div>
                            </>
                        ) : (
                            <div
                                onClick={() => {
                                    api.get("/removeFromList?key=" + props.event["key"])
                                        .then((res) => {
                                            if (res.status === 200) {
                                                setisDropdown(false);
                                                props.closeDetail();
                                                props.reload();
                                            }
                                        })
                                        .catch((err) => {});
                                }}
                                className="detail-drop-delete">
                                <i className="fas fa-trash"></i>Quit this event
                            </div>
                        )}
                    </div>
                ) : null}
                <div className="detail-line">
                    <i style={{ color: props.event["color"] }} className="fas fa-clock"></i>
                    <p>{date_debut}</p>
                </div>
                <div className="detail-line">
                    <i style={{ color: props.event["color"] }} className="fas fa-hourglass"></i>
                    <p>{duration}</p>
                </div>
                <div className="detail-line">
                    <i style={{ color: props.event["color"] }} className="fas fa-calendar"></i>
                    <p>{props.event["calendar"]}</p>
                </div>
                {repetition !== "" ? (
                    <div className="detail-line">
                        <i style={{ color: props.event["color"] }} className="fas fa-redo"></i>
                        <p>{repetition}</p>
                    </div>
                ) : null}
                {props.event["shared"] && props.event["other_users_email"] !== "" ? (
                    <>
                        <div className="detail-line">
                            <i style={{ color: props.event["color"] }} className="fa-solid fa-user-large"></i>
                            <p>{props.event["owner"]}</p>
                        </div>
                        <div className="detail-line">
                            <i style={{ color: props.event["color"] }} className="fa-solid fa-users"></i>
                            <p>{JSON.parse(props.event["other_users_email"]).map((x) => x + " ")}</p>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};
