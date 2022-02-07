import React, { useState } from "react";
import { MonthlyCalendarDay } from "./MonthlyCalendarDay";
import { MonthlyTopbar } from "./MonthlyTopbar";
import { AddPopup } from "./AddPopup";
import axios from "axios";
// import { api } from './Main'
// import AES from 'crypto-js'
// import { useCookies } from "react-cookie"
import { EventDetail } from "./EventDetail";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export const MonthlyCalendar = (props) => {
    var user = props.user;
    var annim = props.annim;

    var touchStartX = 0;
    // eslint-disable-next-line
    var touchStartY = 0;

    // const [cookies, setCookie] = useCookies();

    const [isExpanded, setisExpanded] = useState(false);

    const [timeAdd, settimeAdd] = useState(new Date().getTime() / 1000);

    const [, setState] = useState();

    // const monthConv = {
    //     1: 'January',
    //     2: 'February',
    //     3: 'March',
    //     4: 'April',
    //     5: 'May',
    //     6: 'June',
    //     7: 'July',
    //     8: 'August',
    //     9: 'September',
    //     10: 'October',
    //     11: 'November',
    //     12: 'December',
    // }

    const [isDetail, setisDetail] = useState(-1);
    const [isAdd, setisAdd] = useState(false);

    // const [addEvent, setAddEvent] = useState([])

    var eventList = props.eventList;

    function reload() {
        props.reload();
    }

    function dispatchEvent(nbr) {
        // récup le nbr du jour réel
        let offset = new Date(props.year, props.month - 1, 1).getDay();
        if (offset === 0) {
            offset = 7;
        }
        offset = offset - 1;
        let start_date = new Date(props.year, props.month - 1, nbr - offset).getTime() / 1000;
        let end_date = new Date(props.year, props.month - 1, nbr - offset, 23, 59, 59).getTime() / 1000;
        let tempStockage = [];
        for (let i = 0; i < props.eventList.length; i++) {
            let event = props.eventList[i];
            event["blank"] = false;
            if (event["start_date"] >= start_date && event["start_date"] <= end_date) {
                tempStockage.push(event);
            } else if (event["end_date"] >= start_date && event["end_date"] <= end_date) {
                tempStockage.push(event);
            } else if (event["start_date"] <= start_date && event["end_date"] >= end_date) {
                tempStockage.push(event);
            }
        }
        while (tempStockage.length < 4) {
            tempStockage.push({ "blank": true });
        }
        return tempStockage;
    }

    function setPopup(test) {
        props.setAnnim("");
        setisDetail(test);
    }
    function closePopup() {
        setisDetail(-1);
    }

    function handleUpdate() {
        setState({});
    }
    function expand() {
        if (isExpanded === false) {
            setisExpanded(true);
            handleUpdate();
        } else {
            setisExpanded(false);
            handleUpdate();
        }
    }
    function offsetDebut(dayNbr) {
        var day = new Date(props.year, props.month - 1, 1).getDay();
        if (day === 0) {
            day = 7;
        }
        if (day > dayNbr) {
            return true;
        } else {
            return false;
        }
    }
    function offsetFin(dayNbr) {
        var day = new Date(props.year, props.month, 0).getDay();
        if (day === 0) {
            day = 7;
        }
        if (day >= dayNbr) {
            return false;
        } else {
            return true;
        }
    }
    function getJour(nbr) {
        var offsetbeggin = new Date(props.year, props.month - 1, 0).getDay();
        var day = new Date(props.year, props.month - 1, nbr - offsetbeggin);
        return day;
    }

    //le fait on arrive a appeler la fonction expand depuis le composant dernière line mais pas dans le parent, je fait donc un composant parent a toutes les lignes

    const Line = (props) => {
        //const [isOut, setIsOut] = useState(props.isExpanded);
        //const [offset, setoffset] = useState(props.offset);

        return (
            <>
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(1).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(1)}
                    day={getJour(1)}
                    disabled={offsetDebut(1)}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(2).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(2)}
                    day={getJour(2)}
                    disabled={offsetDebut(2)}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(3).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(3)}
                    day={getJour(3)}
                    disabled={offsetDebut(3)}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(4).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(4)}
                    day={getJour(4)}
                    disabled={offsetDebut(4)}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(5).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(5)}
                    day={getJour(5)}
                    disabled={offsetDebut(5)}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(6).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(6)}
                    day={getJour(6)}
                    disabled={offsetDebut(6)}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(7).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(7)}
                    day={getJour(7)}
                    disabled={offsetDebut(7)}
                    numColor="#FF6B35"
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(8).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(8)}
                    day={getJour(8)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(9).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(9)}
                    day={getJour(9)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(10).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(10)}
                    day={getJour(10)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(11).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(11)}
                    day={getJour(11)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(12).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(12)}
                    day={getJour(12)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(13).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(13)}
                    day={getJour(13)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(14).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(14)}
                    day={getJour(14)}
                    disabled={false}
                    numColor="#FF6B35"
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(15).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(15)}
                    day={getJour(15)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(16).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(16)}
                    day={getJour(16)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(17).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(17)}
                    day={getJour(17)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(18).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(18)}
                    day={getJour(18)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(19).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(19)}
                    day={getJour(19)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(20).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(20)}
                    day={getJour(20)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(21).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(21)}
                    day={getJour(21)}
                    disabled={false}
                    numColor="#FF6B35"
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(22).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(22)}
                    day={getJour(22)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(23).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(23)}
                    day={getJour(23)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(24).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(24)}
                    day={getJour(24)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(25).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(25)}
                    day={getJour(25)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(26).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(26)}
                    day={getJour(26)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(27).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(27)}
                    day={getJour(27)}
                    disabled={false}
                />
                <MonthlyCalendarDay
                    year={props.year}
                    month={props.month}
                    annim={props.annim}
                    reload={() => props.reload()}
                    user={user}
                    fullList={eventList}
                    ajouterIci={() => {
                        settimeAdd(getJour(28).getTime() / 1000);
                        setisAdd(true);
                    }}
                    open={(nbr) => setPopup(nbr)}
                    etendre={() => {
                        expand();
                    }}
                    expand={isExpanded}
                    eventList={dispatchEvent(28)}
                    day={getJour(28)}
                    disabled={false}
                    numColor="#FF6B35"
                />
                {offsetDebut(1) === false && offsetFin(7) === false ? null : (
                    <>
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(29).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(29)}
                            day={getJour(29)}
                            disabled={offsetFin(1)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(30).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(30)}
                            day={getJour(30)}
                            disabled={offsetFin(2)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(31).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(31)}
                            day={getJour(31)}
                            disabled={offsetFin(3)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(32).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(32)}
                            day={getJour(32)}
                            disabled={offsetFin(4)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(33).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(33)}
                            day={getJour(33)}
                            disabled={offsetFin(5)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(34).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(34)}
                            day={getJour(34)}
                            disabled={offsetFin(6)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(35).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(35)}
                            day={getJour(35)}
                            disabled={offsetFin(7)}
                            numColor={offsetFin(7) ? "#cc3600" : "#FF6B35"}
                        />
                    </>
                )}
                {new Date(props.year, props.month, 0).getDate() - getJour(36).getDate() < 15 ? (
                    <>
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(36).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(36)}
                            day={getJour(36)}
                            disabled={offsetFin(2)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(37).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(37)}
                            day={getJour(37)}
                            disabled={offsetFin(3)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(38).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(38)}
                            day={getJour(38)}
                            disabled={offsetFin(4)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(39).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(39)}
                            day={getJour(39)}
                            disabled={offsetFin(5)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(40).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(40)}
                            day={getJour(40)}
                            disabled={offsetFin(6)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(41).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(41)}
                            day={getJour(41)}
                            disabled={offsetFin(7)}
                        />
                        <MonthlyCalendarDay
                            year={props.year}
                            month={props.month}
                            annim={props.annim}
                            reload={() => props.reload()}
                            user={user}
                            fullList={eventList}
                            ajouterIci={() => {
                                settimeAdd(getJour(42).getTime() / 1000);
                                setisAdd(true);
                            }}
                            open={(nbr) => setPopup(nbr)}
                            etendre={() => {
                                expand();
                            }}
                            eventList={dispatchEvent(42)}
                            day={getJour(42)}
                            disabled={offsetFin(7)}
                        />
                    </>
                ) : null}
            </>
        );
    };

    function getEventByNbr(nbr) {
        for (let i = 0; i < eventList.length; i++) {
            if (eventList[i]["nbr"] === nbr) {
                return eventList[i];
            }
        }
    }

    if (isAdd) {
        annim = "";
    }

    return (
        <div className="monthly-calendar">
            <MonthlyTopbar
                mobile={props.mobile}
                add={() => {
                    setisAdd(true);
                    props.setAnnim("");
                }}
                switch={props.switch}
                month={props.month}
                year={props.year}
                nextMonth={() => props.nextMonth()}
                prevMonth={() => props.prevMonth()}
            />
            <div
                className={props.annim + " monthly-actual"}
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
                <Line annim={annim} reload={() => props.reload()} year={props.year} month={props.month} />
            </div>
            {isDetail !== -1 ? (
                <EventDetail setEdit={(x) => props.setEdit(x)} reload={() => reload()} nbr={isDetail} event={getEventByNbr(isDetail)} closeDetail={() => closePopup()} />
            ) : isAdd ? (
                <AddPopup
                    user={user}
                    time={timeAdd}
                    ajouterEvent={(x) => props.ajouterEvent(x)}
                    calendarList={(x) => props.calendarList}
                    setisAdd={() => setisAdd(false)}
                />
            ) : null}
        </div>
    );
};
