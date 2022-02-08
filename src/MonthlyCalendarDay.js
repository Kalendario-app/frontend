import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { decryptCode } from "./Main";
import { useCookies } from "react-cookie";
import AES from "crypto-js";
import { api } from "./Main";
import { sha256 } from "js-sha256";

export const MonthlyCalendarDay = (props) => {
    const colorCodeConv = ["#3581B8", "#5BA94C", "#E4C111", "#FF6B35", "#A72A2A"];

    const [cookies] = useCookies();
    var varCode = "";
    if (cookies.code !== undefined) {
        varCode = cookies.code;
    } else if (sessionStorage.getItem("code") !== null) {
        varCode = sessionStorage.getItem("code");
    } else {
        varCode = "";
    }

    function getWeekNum(year, month) {
        var daysNum = 32 - new Date(year, month, 32).getDate(),
            fDayO = new Date(year, month, 1).getDay(),
            fDay = fDayO ? fDayO - 1 : 6,
            weeksNum = Math.ceil((daysNum + fDay) / 7);
        return weeksNum;
    }

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "monthly-event",
        drop: (item) => {
            var evnt = props.fullList.find((arg) => {
                return arg["key"] === item.key;
            });
            var newDateS = props.day;
            var oldDateS = new Date(evnt["start_date"] * 1000);
            var oldDateE = new Date(evnt["end_date"] * 1000);
            var dS = oldDateE.getSeconds() - oldDateS.getSeconds();
            var dM = oldDateE.getMinutes() - oldDateS.getMinutes();
            var dH = oldDateE.getHours() - oldDateS.getHours();
            var dD = oldDateE.getDate() - oldDateS.getDate();
            var dMn = oldDateE.getMonth() - oldDateS.getMonth();
            var dY = oldDateE.getFullYear() - oldDateS.getFullYear();
            newDateS.setHours(oldDateS.getHours() - 1);
            newDateS.setMinutes(oldDateS.getMinutes());
            newDateS.setSeconds(oldDateS.getSeconds());
            newDateS.setMilliseconds(oldDateS.getMilliseconds());
            var newDateE = new Date(newDateS);
            newDateE.setHours(newDateE.getHours() + dH);
            newDateE.setMinutes(newDateE.getMinutes() + dM);
            newDateE.setSeconds(newDateE.getSeconds() + dS);
            newDateE.setDate(newDateE.getDate() + dD);
            newDateE.setMonth(newDateE.getMonth() + dMn);
            newDateE.setFullYear(newDateE.getFullYear() + dY);
            let fullCode = decryptCode(varCode, props.user);
            fullCode = fullCode.concat(" ceci est du sel");
            var bytes = AES.AES.encrypt(evnt["event_name"], fullCode);
            var encrypted = bytes.toString();
            var color = colorCodeConv.findIndex((arg) => {
                return arg === evnt["color"];
            });
            var data = {
                "event_name": encrypted,
                "start_date": (newDateS.getTime() / 1000) * (parseInt(sha256(fullCode)) + parseInt(sha256(fullCode + "test")) + fullCode.length),
                "end_date": (newDateE.getTime() / 1000) * (parseInt(sha256(fullCode)) + parseInt(sha256(fullCode + "test")) + fullCode.length),
                "color": color,
                "full": evnt["full"],
                "key": evnt["key"],
                "calendar": AES.AES.encrypt(evnt["calendar"], fullCode).toString(),
                "recurence": evnt["recurence"],
                "recurenceEndType": evnt["recurenceEndType"],
                "recurenceEndNbr": evnt["recurenceEndNbr"],
            };
            api.post("/editEvent", data).then((res) => {
                if (res.status === 202) {
                    props.reload();
                }
            });
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [{ isAddOver }, dropAdd] = useDrop(() => ({
        accept: "add",
        drop: (item) => {
            props.ajouterIci();
        },
        collect: (monitor) => ({
            isAddOver: !!monitor.isOver(),
        }),
    }));

    var isToday = false;
    var today = new Date();

    if (props.day.getDate() === today.getDate() && props.day.getMonth() === today.getMonth() && props.day.getFullYear() === today.getFullYear()) {
        isToday = true;
    }

    var nbrEvents = [];

    var height = Math.floor((window.innerHeight - 530) / 100);

    if (window.matchMedia("(max-width: 1270px)").matches) {
        height = Math.floor((window.innerHeight - 530) / 100);
    }
    if (window.matchMedia("(max-width: 600px)").matches) {
        height = Math.floor((window.innerHeight - 330) / 100);
    }
    if (window.matchMedia("(max-width: 400px)").matches) {
        height = Math.floor((window.innerHeight - 230) / 100);
    }

    if (getWeekNum(props.year, props.month - 1) === 6) {
        height = height - 1;
    }

    if (height < 1) {
        height = 1;
    }

    for (let i = 0; i < height; i++) {
        nbrEvents.push(i);
    }

    const eventList = props.eventList.map((x) => x);
    function screenDate(date) {
        var heur = date.getHours();
        var minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (heur < 10) {
            heur = "0" + heur;
        }
        return heur + "h" + minutes;
    }
    for (let i = 0; i < eventList.length; i++) {
        var event = eventList[i];
        if (event["end_date"] - event["start_date"] < 86400) {
            var date = new Date(event["start_date"] * 1000);
            event["display_date"] = screenDate(date);
        }
    }

    while (eventList.length < nbrEvents.length) {
        const blankEvent = { "blank": true };
        eventList.push(blankEvent);
    }

    function openPopup(nbr) {
        props.open(nbr);
    }

    // for all item in eventList, if key is the same and one is blank, the blank get pushed back
    eventList.sort((a, b) => {
        if (a["key"] === b["key"]) {
            if (a["blank"] && !b["blank"]) {
                return 1;
            } else if (!a["blank"] && b["blank"]) {
                return -1;
            } else {
                return 0;
            }
        } else {
            if (a["blank"]) {
                return 1;
            } else {
                return a["start_date"] - b["start_date"];
            }
        }
    });

    const MonthlyCalendarItem = (props) => {
        // eslint-disable-next-line
        const [{ isDragging }, drag] = useDrag(() => ({
            type: "monthly-event",
            item: {
                key: props.cle,
            },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }), // collect is called whenever the drag starts or stops
        }));

        if (props.blank) {
            return (
                <div className="monthly-item" style={{ visibility: "hidden" }}>
                    <p style={{ marginLeft: "5px" }}>You found me GG !</p>
                </div>
            );
        } else {
            return (
                <div
                    ref={drag}
                    onClick={() => openPopup(props.nbr)}
                    className="monthly-item"
                    style={{
                        borderLeft: props.full ? "none" : "solid",
                        borderColor: props.color,
                        borderWidth: "2px",
                        boxSizing: "border-box",
                        backgroundColor: props.full ? props.color : null,
                        color: props.full ? "#F7FAFD" : "#1B2228",
                        borderRadius: props.full ? ".5em" : "0px",
                        width: "calc(" + 100 * props.len + "% - 1.6em)",
                    }}>
                    <p>{props.name}</p>
                    <p>{props.date}</p>
                </div>
            );
        }
    };

    return (
        <div
            ref={drop}
            className={isOver ? "monthly-day-card monthly-drag-card " + props.annim : "monthly-day-card " + props.annim}
            onDoubleClick={() => props.ajouterIci()}>
            <div className="monthly-number-container">
                <p
                    className="monthly-number"
                    variant="h5"
                    style={{
                        textAlign: "right",
                        color: props.day.getDay() === 0 ? (isToday ? "#D75628" : "#FF6B35") : "inherit",
                        backgroundColor: isToday ? "#3581b873" : "none",
                    }}>
                    {props.day.getDate()}
                </p>
            </div>
            <div ref={dropAdd} className="events-list">
                {isAddOver ? (
                    <div className="add-hover-monthly-container">
                        <div className="add-hover-monthly">
                            <div className="add-hover-monthly-plus">
                                <p>+</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <></>
                )}
                {nbrEvents.map((x) => (
                    <MonthlyCalendarItem
                        key={x}
                        nbr={eventList[x]["nbr"]}
                        name={eventList[x]["event_name"]}
                        blank={eventList[x]["blank"]}
                        date={eventList[x]["display_date"]}
                        color={eventList[x]["color"]}
                        full={eventList[x]["full"]}
                        cle={eventList[x]["key"]}
                        len={eventList[x]["nbr-day"]}
                    />
                ))}
            </div>
        </div>
    );
};
//<ExpandButton onPress={() => agrandir()}/>
//
