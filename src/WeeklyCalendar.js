import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { decryptCode } from "./Main";
import { useCookies } from "react-cookie";
import AES from "crypto-js";
import { api } from "./Main";
import { AddPopup } from "./AddPopup";
// import { api } from './Main'
// import AES from 'crypto-js'
// import { useCookies } from "react-cookie"
import { EventDetail } from "./EventDetail";
import { sha256 } from "js-sha256";

export const WeeklyCalendar = (props) => {
    var hu = Math.floor(window.innerHeight / 100);
    if (hu < 8) {
        hu = 8;
    }

    var user = props.user;

    function reload() {
        props.reload();
    }

    const [cookies] = useCookies();
    var varCode = "";
    /*if (cookies.code !== undefined) {
        varCode = cookies.code;
    } else*/ if (sessionStorage.getItem("code") !== null) {
        varCode = sessionStorage.getItem("code");
    } else {
        varCode = "";
    }

    var eventList = props.eventList;

    var touchStartX = 0;
    // eslint-disable-next-line
    var touchStartY = 0;

    const [isDetail, setisDetail] = useState(-1);
    const [isAdd, setisAdd] = useState(false);

    //eslint-disable-next-line
    const [timeAdd, setTimeAdd] = useState(new Date().getTime() / 1000);

    const [oldEvent, setOldEvent] = useState();

    const [reAffich, SetreAffich] = useState(0);

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
    // const colorCodeConv = ['#3581B8', '#5BA94C', '#E4C111', '#FF6B35', '#A72A2A']

    //retourne la date de debut du jour moyenant le numéro de colonne (0 = lundis 6 = dimanche)
    function rowToJour(nbr) {
        let mon = getDateOfISOWeek();
        return new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + nbr);
    }
    //retourne la dernière seconde du jour moyenant le num de colonne
    function lastOfDay(nbr) {
        let mon = getDateOfISOWeek();
        return new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + nbr, 23, 59, 59);
    }
    function getDateOfISOWeek() {
        var simple = new Date(props.year, 0, 1 + (props.week - 1) * 7);
        var dow = simple.getDay();
        var ISOweekStart = simple;
        if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }

    function getHourString(nbr) {
        let date = new Date(nbr * 1000);
        let hour = date.getHours();
        let min = date.getMinutes();
        if (min < 10) {
            min = "0" + min;
        }
        if (hour < 10) {
            hour = "0" + hour;
        }
        return hour + "h" + min;
    }

    //retourne le décalage au debut du calendrier (0 si mois commence par lundis, 6 si dimanche)
    // function offsetDebut() {
    //     var day = new Date(props.year, props.month - 1, 1).getDay();
    //     if (day === 0) {
    //         day = 7
    //     }
    //     day = day - 1
    //     return day
    // }

    function setPopup(test) {
        setisDetail(test);
    }
    function closePopup() {
        //todo add annimation
        setisDetail(-1);
    }

    const dayOfWeek = ["Monday", "Thuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const [doublesIndex, setDoublesIndex] = useState([]);

    //attribuer aux event une propriété duration et position
    //dabord filtrer les date extérieurs a la semaine puis les dates par jour et leurs donner une position x puis par heur et leur donner un posy
    var events = eventList.map((x) => x);
    var weeklyStockage = [[], [], [], [], [], [], []];
    var topWeeklyStockage = [[], [], [], [], [], [], []];
    var isTop = false;

    for (let i = 0; i < events.length; i++) {
        //tri des event trop long et attribution de la longueur + posistion pour les long
        let durationT = events[i]["end_date"] - events[i]["start_date"] + 1;
        let start_dateT = new Date(events[i]["start_date"] * 1000);
        //events[i]['dayNbr'] = Math.floor(durationT / 86400)
        events[i]["dayNbr"] = Math.floor(events[i]["end_date"] / 86400) - Math.floor(events[i]["start_date"] / 86400);
        if (events[i]["dayNbr"] > 0) {
            console.log("object");
            events[i]["height"] = 4 * hu + "px";
            events[i]["longueur"] = events[i]["dayNbr"] + "00%";
            let lmao = start_dateT.getDay() - 1;
            if (lmao < 0) {
                lmao = 6;
            }
            topWeeklyStockage[lmao].push(events[i]);
            isTop = true;
        } else {
            events[i]["height"] = Math.floor(durationT / 600) * hu + "px";
            events[i]["heightRaw"] = Math.floor(durationT / 600);
            events[i]["displayDate"] = getHourString(events[i]["start_date"]) + " > " + getHourString(events[i]["end_date"]);
        }
        events[i]["borderColor"] = events[i]["color"];
        events[i]["fillColor"] = events[i]["color"] + "7e";
    }
    //attribuer les jour (les event sont dispaché dans l'array weekly stockage)
    for (let i = 0; i < dayOfWeek.length; i++) {
        let debut = rowToJour(i).getTime() / 1000;
        let fin = lastOfDay(i).getTime() / 1000;
        for (let j = 0; j < events.length; j++) {
            let event = events[j];
            if (event["dayNbr"] === 0 && event["start_date"] > debut && event["end_date"] < fin) {
                let position = event["start_date"] - debut;
                event["posY"] = Math.floor(position / 600) * hu + "px";
                weeklyStockage[i].push(event);
            }
        }
    }

    if (oldEvent !== eventList) {
        for (let i = 0; i < weeklyStockage.length; i++) {
            var positionList = {};
            var indexList = {};
            var tmpDoublesIndex = doublesIndex;
            for (let j = 0; j < weeklyStockage[i].length; j++) {
                let event = weeklyStockage[i][j];
                if (positionList[event["posY"]] !== undefined) {
                    positionList[event["posY"]] += 1;
                    event["double"] = positionList[event["posY"]];
                    event["doubleIndex"] = indexList[event["posY"]];
                } else {
                    positionList[event["posY"]] = 0;
                    var index = tmpDoublesIndex.push(false) - 1;
                    event["doubleIndex"] = index;
                    indexList[event["posY"]] = index;
                    event["double"] = -1;
                }
            }
            for (let k = 0; k < weeklyStockage[i].length; k++) {
                let event = weeklyStockage[i][k];
                if (positionList[event["posY"]] === 0) {
                    event["preventDouble"] = true;
                } else {
                    event["preventDouble"] = false;
                }
            }
            setOldEvent(eventList);
            setDoublesIndex(tmpDoublesIndex);
        }
    }

    //utilisé pour changer de mois a semaine
    function changement() {
        props.switch();
    }

    function stringFilter(str) {
        let tmp = "";
        let nbrs = "1234567890";
        for (let i = 0; i < str.length; i++) {
            if (nbrs.includes(str[i])) {
                tmp = tmp.concat(str[i]);
            }
        }
        return tmp;
    }
    function keyGen(code) {
        let tmp = stringFilter(sha256(code)) + stringFilter(sha256(code + "test")) + code.length;
        if (toString(tmp).length > 8) {
            tmp = tmp.slice(0, 7);
        }
        return parseInt(tmp);
    }

    const colorCodeConv = ["#3581B8", "#5BA94C", "#E4C111", "#FF6B35", "#A72A2A"];

    const WeeklyTopbar = (props) => {
        return (
            <div className="weekly-topbar">
                <div className="weekly-nav">
                    <h2>
                        Week {props.week} ({monthConv[props.month]}), {props.year}
                    </h2>
                    <p className="weekly-prev" onClick={() => props.prevWeek()}>
                        &#60;
                    </p>
                    <p className="weekly-next" onClick={() => props.nextWeek()}>
                        &#62;
                    </p>
                    {window.matchMedia("(max-width: 450px)").matches ? null : (
                        <div className="select-wrapper cal-type-switch">
                            {" "}
                            <select
                                onChange={(e) => {
                                    if (e.target.value === "monthly") {
                                        changement();
                                    }
                                }}
                                className="cal-type-switch-in">
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    )}
                </div>
                {window.matchMedia("(max-width: 450px)").matches ? (
                    <div className="select-wrapper cal-type-switch">
                        {" "}
                        <select
                            onChange={(e) => {
                                if (e.target.value === "monthly") {
                                    changement();
                                }
                            }}
                            className="cal-type-switch-in">
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                ) : null}
                <div className="weekly-top-button cta-button">
                    <button className="button-full" onClick={() => props.add()}>
                        <span className="plus-add">+</span>
                        {window.matchMedia("(max-width: 450px)").matches ? null : "New"}
                    </button>
                </div>
            </div>
        );
    };
    const DayRow = (props) => {
        var evenements = props.evenements;

        const WeekCell = (props) => {
            const [{ isOver }, drop] = useDrop(() => ({
                accept: "weekly-event",
                drop: (item) => {
                    var evnt = props.fullList.find((arg) => {
                        return arg["key"] === item.key;
                    });
                    var newDateS = props.date;
                    var oldDateS = new Date(evnt["start_date"] * 1000);
                    var oldDateE = new Date(evnt["end_date"] * 1000);
                    var dS = oldDateE.getSeconds() - oldDateS.getSeconds();
                    var dM = oldDateE.getMinutes() - oldDateS.getMinutes();
                    var dH = oldDateE.getHours() - oldDateS.getHours();
                    var dD = oldDateE.getDate() - oldDateS.getDate();
                    var dMn = oldDateE.getMonth() - oldDateS.getMonth();
                    var dY = oldDateE.getFullYear() - oldDateS.getFullYear();
                    newDateS.setHours(props.hour - 1);
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
                    let fullCode = decryptCode(varCode, user);
                    fullCode = fullCode.concat(" ceci est du sel");
                    var bytes = AES.AES.encrypt(evnt["event_name"], fullCode);
                    var encrypted = bytes.toString();
                    var color = colorCodeConv.findIndex((arg) => {
                        return arg === evnt["color"];
                    });
                    var TZoffset = new Date().getTimezoneOffset() * 60;
                    var data = {
                        "event_name": encrypted,
                        "start_date": newDateS.getTime() / 1000 + keyGen(fullCode),
                        "end_date": newDateE.getTime() / 1000 + keyGen(fullCode),
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
                            reload();
                        }
                    });
                },
                collect: (monitor) => ({
                    isOver: !!monitor.isOver(),
                }),
            }));

            return <div className={isOver ? "weekly-cell monthly-drag-card" : "weekly-cell"} ref={drop} style={{ minHeight: 6 * hu + "px" }} />;
        };

        return (
            <div className="day-row">
                <WeekCell fullList={props.fullList} date={props.date} hour={0} />
                <WeekCell fullList={props.fullList} date={props.date} hour={1} />
                <WeekCell fullList={props.fullList} date={props.date} hour={2} />
                <WeekCell fullList={props.fullList} date={props.date} hour={3} />
                <WeekCell fullList={props.fullList} date={props.date} hour={4} />
                <WeekCell fullList={props.fullList} date={props.date} hour={5} />
                <WeekCell fullList={props.fullList} date={props.date} hour={6} />
                <WeekCell fullList={props.fullList} date={props.date} hour={7} />
                <WeekCell fullList={props.fullList} date={props.date} hour={8} />
                <WeekCell fullList={props.fullList} date={props.date} hour={9} />
                <WeekCell fullList={props.fullList} date={props.date} hour={10} />
                <WeekCell fullList={props.fullList} date={props.date} hour={11} />
                <WeekCell fullList={props.fullList} date={props.date} hour={12} />
                <WeekCell fullList={props.fullList} date={props.date} hour={13} />
                <WeekCell fullList={props.fullList} date={props.date} hour={14} />
                <WeekCell fullList={props.fullList} date={props.date} hour={15} />
                <WeekCell fullList={props.fullList} date={props.date} hour={16} />
                <WeekCell fullList={props.fullList} date={props.date} hour={17} />
                <WeekCell fullList={props.fullList} date={props.date} hour={18} />
                <WeekCell fullList={props.fullList} date={props.date} hour={19} />
                <WeekCell fullList={props.fullList} date={props.date} hour={20} />
                <WeekCell fullList={props.fullList} date={props.date} hour={21} />
                <WeekCell fullList={props.fullList} date={props.date} hour={22} />
                <WeekCell fullList={props.fullList} date={props.date} hour={23} />
                {evenements.map((x, index) => (
                    <WeeklyEvent
                        absolute
                        isDouble={doublesIndex[x["doubleIndex"]]}
                        doubleIndex={x["doubleIndex"]}
                        double={x["double"]}
                        preventDouble={x["preventDouble"]}
                        open={(nbr) => setPopup(nbr)}
                        nbr={index}
                        name={x["event_name"]}
                        hour={x["displayDate"]}
                        position={x["posY"]}
                        duration={x["height"]}
                        durationRaw={x["heightRaw"]}
                        padding
                        backColor={x["fillColor"]}
                        borderColor={x["borderColor"]}
                        cle={x["key"]}
                    />
                ))}
                {props.date.getDate() === new Date().getDate() &&
                props.date.getMonth() === new Date().getMonth() &&
                props.date.getFullYear() === new Date().getFullYear() ? (
                    <div className="weekly-now-marker" style={{ top: (new Date().getHours() * 6 + new Date().getMinutes() / 10) * hu + "px" }}>
                        <div className="weekly-now-marker-inner" />
                        <div className="weekly-now-marker-inner" />
                    </div>
                ) : (
                    <></>
                )}
            </div>
        );
    };
    const WeeklyEvent = (props) => {
        function openPopup() {
            props.open(props.nbr);
        }

        function generateX() {
            if (props.isDouble === false || props.double === -1) {
                return props.absolute ? props.position : null;
            } else {
                let num = parseInt(props.position) + props.double * parseInt(props.duration);
                return num + "px";
            }
        }

        // eslint-disable-next-line
        const [{ isDragging }, drag] = useDrag(() => ({
            type: "weekly-event",
            item: {
                key: props.cle,
            },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }), // collect is called whenever the drag starts or stops
        }));

        if (props.double === -1 || props.isDouble === true || props.double === undefined) {
            return (
                <div
                    onClick={() => openPopup()}
                    className="weekly-event"
                    ref={drag}
                    key={props.cle}
                    style={{
                        position: props.absolute ? "absolute" : false,
                        top: generateX(),
                        bottom: props.absolute ? null : props.position,
                        left: props.isDouble && props.double !== -1 ? "2em" : null,
                        boxShadow: props.isDouble && props.double !== -1 ? "-17px -1px 41px 2px #3b3b3b27" : null,
                        height: props.duration,
                        padding: props.padding ? "5px" : "0px",
                        backgroundColor: props.backColor,
                        borderColor: props.borderColor,
                        width: props.width,
                    }}>
                    <p className="weekly-event-name">{props.name}</p>
                    <p
                        className="weekly-event-hour"
                        style={{
                            position: "relative",
                            top: props.durationRaw >= 12 ? 2 * hu + "px" : "0",
                        }}>
                        {props.hour}
                    </p>
                    {props.double === -1 && props.preventDouble !== true && props.isDouble === false ? (
                        <div
                            className="weekly-overflow-indicator"
                            onClick={(e) => {
                                e.stopPropagation();
                                let tmp = doublesIndex;
                                tmp[props.doubleIndex] = true;
                                setDoublesIndex(tmp);
                                SetreAffich(reAffich + 1);
                            }}>
                            +
                        </div>
                    ) : props.isDouble && props.double === -1 ? (
                        <div
                            className="weekly-overflow-indicator"
                            onClick={(e) => {
                                e.stopPropagation();
                                let tmp = doublesIndex;
                                tmp[props.doubleIndex] = false;
                                setDoublesIndex(tmp);
                                SetreAffich(reAffich + 1);
                            }}>
                            -
                        </div>
                    ) : null}
                </div>
            );
        } else {
            return null;
        }
    };
    const NumRow = (props) => {
        var hours = [
            "0h00",
            "1h00",
            "2h00",
            "3h00",
            "4h00",
            "5h00",
            "6h00",
            "7h00",
            "8h00",
            "9h00",
            "10h00",
            "11h00",
            "12h00",
            "13h00",
            "14h00",
            "15h00",
            "16h00",
            "17h00",
            "18h00",
            "19h00",
            "20h00",
            "21h00",
            "22h00",
            "23h00",
        ];

        return (
            <div className="number-row">
                {hours.map((hours) => (
                    <div key={hours} className="number-cell" style={{ minHeight: 6 * hu + "px" }}>
                        {hours}
                    </div>
                ))}
            </div>
        );
    };

    /*eslint-disable-next-line*/
    var ajd = new Date();

    useEffect(() => {
        document.getElementById("weekly-scroll-cont").scrollTop = hu * 6 * (ajd.getHours() + ajd.getMinutes() / 60 - 2);
    }, [hu, ajd]);

    return (
        <div className="weekly-calendar" style={{ height: 82 * hu + "px" }}>
            <WeeklyTopbar
                add={() => setisAdd(true)}
                nextWeek={() => props.nextWeek()}
                prevWeek={() => props.prevWeek()}
                week={props.week}
                month={props.month}
                year={props.year}
            />
            <div
                className="weekly-actual"
                onTouchStart={(e) => {
                    touchStartX = e["changedTouches"][0]["clientX"];
                    touchStartY = e["changedTouches"][0]["clientY"];
                }}
                onTouchEnd={(e) => {
                    if (e["changedTouches"][0]["clientX"] - touchStartX < -100) {
                        props.nextMonth();
                    } else if (e["changedTouches"][0]["clientX"] - touchStartX > 100) {
                        props.prevMonth();
                    }
                }}>
                {isTop ? (
                    <div className="weekly-first-line">
                        <div className="number-row">
                            <div className="number-cell" style={{ minHeight: 6 * hu + "px" }}>
                                <p className="hidden">69h00</p>
                            </div>
                            <div className="entire-day-cell"></div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(0).getDate() === ajd.getDate() && rowToJour(0).getMonth() === ajd.getMonth() && rowToJour(0).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(0).getDate()}</h3>
                                <p>Monday</p>
                            </div>
                            <div className="entire-day-cell">
                                {topWeeklyStockage[0].map((x) => (
                                    <WeeklyEvent
                                        preventDouble={true}
                                        key={x}
                                        open={(nbr) => setPopup(nbr)}
                                        nbr={eventList.indexOf(x)}
                                        name={x["event_name"]}
                                        duration={x["height"]}
                                        padding
                                        backColor={x["fillColor"]}
                                        borderColor={x["borderColor"]}
                                        width={x["longueur"]}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(1).getDate() === ajd.getDate() && rowToJour(1).getMonth() === ajd.getMonth() && rowToJour(1).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(1).getDate()}</h3>
                                <p>Tuesday</p>
                            </div>
                            <div className="entire-day-cell">
                                {topWeeklyStockage[1].map((x) => (
                                    <WeeklyEvent
                                        preventDouble={true}
                                        key={x}
                                        open={(nbr) => setPopup(nbr)}
                                        nbr={eventList.indexOf(x)}
                                        name={x["event_name"]}
                                        duration={x["height"]}
                                        padding
                                        backColor={x["fillColor"]}
                                        borderColor={x["borderColor"]}
                                        width={x["longueur"]}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(2).getDate() === ajd.getDate() && rowToJour(2).getMonth() === ajd.getMonth() && rowToJour(2).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(2).getDate()}</h3>
                                <p>Wednesday</p>
                            </div>
                            <div className="entire-day-cell">
                                {topWeeklyStockage[2].map((x) => (
                                    <WeeklyEvent
                                        preventDouble={true}
                                        key={x}
                                        open={(nbr) => setPopup(nbr)}
                                        nbr={eventList.indexOf(x)}
                                        name={x["event_name"]}
                                        duration={x["height"]}
                                        padding
                                        backColor={x["fillColor"]}
                                        borderColor={x["borderColor"]}
                                        width={x["longueur"]}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(3).getDate() === ajd.getDate() && rowToJour(3).getMonth() === ajd.getMonth() && rowToJour(3).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(3).getDate()}</h3>
                                <p>Thursday</p>
                            </div>
                            <div className="entire-day-cell">
                                {topWeeklyStockage[3].map((x) => (
                                    <WeeklyEvent
                                        preventDouble={true}
                                        key={x}
                                        open={(nbr) => setPopup(nbr)}
                                        nbr={eventList.indexOf(x)}
                                        name={x["event_name"]}
                                        duration={x["height"]}
                                        padding
                                        backColor={x["fillColor"]}
                                        borderColor={x["borderColor"]}
                                        width={x["longueur"]}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(4).getDate() === ajd.getDate() && rowToJour(4).getMonth() === ajd.getMonth() && rowToJour(4).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(4).getDate()}</h3>
                                <p>Friday</p>
                            </div>
                            <div className="entire-day-cell">
                                {topWeeklyStockage[4].map((x) => (
                                    <WeeklyEvent
                                        preventDouble={true}
                                        key={x}
                                        open={(nbr) => setPopup(nbr)}
                                        nbr={eventList.indexOf(x)}
                                        name={x["event_name"]}
                                        duration={x["height"]}
                                        padding
                                        backColor={x["fillColor"]}
                                        borderColor={x["borderColor"]}
                                        width={x["longueur"]}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(5).getDate() === ajd.getDate() && rowToJour(5).getMonth() === ajd.getMonth() && rowToJour(5).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(5).getDate()}</h3>
                                <p>Saturday</p>
                            </div>
                            <div className="entire-day-cell">
                                {topWeeklyStockage[5].map((x) => (
                                    <WeeklyEvent
                                        preventDouble={true}
                                        key={x}
                                        open={(nbr) => setPopup(nbr)}
                                        nbr={eventList.indexOf(x)}
                                        name={x["event_name"]}
                                        duration={x["height"]}
                                        padding
                                        backColor={x["fillColor"]}
                                        borderColor={x["borderColor"]}
                                        width={x["longueur"]}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(6).getDate() === ajd.getDate() && rowToJour(6).getMonth() === ajd.getMonth() && rowToJour(6).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(6).getDate()}</h3>
                                <p>Sunday</p>
                            </div>
                            <div className="entire-day-cell">
                                {topWeeklyStockage[6].map((x) => (
                                    <WeeklyEvent
                                        preventDouble={true}
                                        key={x}
                                        open={(nbr) => setPopup(nbr)}
                                        nbr={eventList.indexOf(x)}
                                        name={x["event_name"]}
                                        duration={x["height"]}
                                        padding
                                        backColor={x["fillColor"]}
                                        borderColor={x["borderColor"]}
                                        width={x["longueur"]}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="weekly-first-line">
                        <div className="number-row">
                            <div className="number-cell" style={{ minHeight: 6 * hu + "px" }}>
                                <p className="hidden">69h00</p>
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(0).getDate() === ajd.getDate() && rowToJour(0).getMonth() === ajd.getMonth() && rowToJour(0).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(0).getDate()}</h3>
                                <p>Monday</p>
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(1).getDate() === ajd.getDate() && rowToJour(1).getMonth() === ajd.getMonth() && rowToJour(1).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(1).getDate()}</h3>
                                <p>Tuesday</p>
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(2).getDate() === ajd.getDate() && rowToJour(2).getMonth() === ajd.getMonth() && rowToJour(2).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(2).getDate()}</h3>
                                <p>Wednesday</p>
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(3).getDate() === ajd.getDate() && rowToJour(3).getMonth() === ajd.getMonth() && rowToJour(3).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(3).getDate()}</h3>
                                <p>Thursday</p>
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(4).getDate() === ajd.getDate() && rowToJour(4).getMonth() === ajd.getMonth() && rowToJour(4).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(4).getDate()}</h3>
                                <p>Friday</p>
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(5).getDate() === ajd.getDate() && rowToJour(5).getMonth() === ajd.getMonth() && rowToJour(5).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(5).getDate()}</h3>
                                <p>Saturday</p>
                            </div>
                        </div>
                        <div className="day-row">
                            <div
                                className="weekly-cell"
                                style={{
                                    backgroundColor:
                                        rowToJour(6).getDate() === ajd.getDate() && rowToJour(6).getMonth() === ajd.getMonth() && rowToJour(6).getDate() === ajd.getDate()
                                            ? "#3581b8a9"
                                            : "inherit",
                                    minHeight: 6 * hu + "px",
                                }}>
                                <h3>{rowToJour(6).getDate()}</h3>
                                <p>Sunday</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="weekly-other-line" id="weekly-scroll-cont">
                    <NumRow />
                    <DayRow fullList={props.fullList} evenements={weeklyStockage[0]} date={rowToJour(0)} dayName="Monday" />
                    <DayRow fullList={props.fullList} evenements={weeklyStockage[1]} date={rowToJour(1)} dayName="Tuesday" />
                    <DayRow fullList={props.fullList} evenements={weeklyStockage[2]} date={rowToJour(2)} dayName="Wednesday" />
                    <DayRow fullList={props.fullList} evenements={weeklyStockage[3]} date={rowToJour(3)} dayName="Thursday" />
                    <DayRow fullList={props.fullList} evenements={weeklyStockage[4]} date={rowToJour(4)} dayName="Friday" />
                    <DayRow fullList={props.fullList} evenements={weeklyStockage[5]} date={rowToJour(5)} dayName="Saturday" />
                    <DayRow fullList={props.fullList} evenements={weeklyStockage[6]} date={rowToJour(6)} dayName="Sunday" />
                </div>
            </div>
            {isDetail !== -1 ? (
                <EventDetail reload={() => reload()} nbr={isDetail} event={eventList[isDetail]} closeDetail={() => closePopup()} setEdit={(x) => props.setEdit(x)} />
            ) : isAdd ? (
                <AddPopup
                    time={timeAdd}
                    user={props.user}
                    ajouterEvent={(x) => props.ajouterEvent(x)}
                    calendarList={() => props.calendarList}
                    setisAdd={() => setisAdd(false)}
                />
            ) : null}
        </div>
    );
};
