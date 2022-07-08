import React, { useState } from "react";
import { MonthlyCalendar } from "./MonthlyCalendar";
import { CalendarSelect } from "./CalendarSelect";
import { MiniCalendar } from "./MiniCalendar";
import { WeeklyCalendar } from "./WeeklyCalendar";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Button } from "./Button";
import { sha256 } from "js-sha256";
import AES from "crypto-js";
import { Today } from "./Today";
import { Planning } from "./Planning";
import { Checkbox } from "./Checkbox";
import { EditPopup } from "./EditPopup";
import { Header } from "./Header";
import { Todo } from "./Todo";
import { JSEncrypt } from "jsencrypt";

export function encryptCode(code, user) {
    var key = "";
    if ("email" in user) {
        key = sha256(user["email"]);
        key = key + sha256(user["account_creation_date"]);
        key = sha256(key);
        return AES.AES.encrypt(code, key).toString();
    }
}
export function decryptCode(code, user) {
    var key = "";
    if ("email" in user && code != null) {
        key = sha256(user["email"]);
        key = key + sha256(user["account_creation_date"]);
        key = sha256(key);
        let bt = "";
        try {
            AES.AES.decrypt(code, key).toString(AES.enc.Utf8);
            bt = AES.AES.decrypt(code, key).toString(AES.enc.Utf8);
        } catch (e) {
            return "";
        }
        return bt;
    }
}

axios.defaults.withCredentials = true;

export const api = axios.create({
    //baseURL: process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000/api" : "https://api.kalendario.app/api/",
    //baseURL: "https://api.kalendario.app/api/",
    //baseURL: "http://localhost:8000/api",
    baseURL: "http://127.0.0.1:8000/api/",
    withCredentials: true,
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
});

export const Main = (props) => {
    const [cookies, setCookie] = useCookies();

    var now = new Date();

    const [state, setState] = useState({
        "isCode": false,
        "code": "",
        "codeHash": "",
        "shldFetch": true,
        "isCodeSave": false,
        "isWeekly": false,
        "user": {},
        "checkedMonth": [],
        "year": now.getFullYear(),
        "week": getWeek(now),
        "month": now.getMonth() + 1,
        "annim": "",
        "eventList": [],
        "stockageCalendar": {},
        "recurentEvents": [],
        "display": false,
        "displayList": [],
        "isEdit": null,
        "cantConnect": false,
        "resendDisplay": true,
        "bypassVerif": false,
        "todoList": [],
    });

    var varCode = "";

    /*if (cookies.code !== undefined) {
        varCode = cookies.code;
    } else*/
    if (sessionStorage.getItem("code") !== null) {
        varCode = sessionStorage.getItem("code");
    } else {
        varCode = "";
    }

    // eslint-disable-next-line
    const [update, setUpdate] = useState(0);

    // eslint-disable-next-line
    function changeState(changes) {
        let tmp = state;
        let i = 0;
        for (const [key, value] of Object.entries(changes)) {
            tmp[key] = value;
            i++;
        }
        setState(tmp);
        if (i > 1) {
            setUpdate(new Date().getTime());
        }
        setUpdate(new Date().getTime());
    }

    const colorCodeConv = ["#3581B8", "#5BA94C", "#E4C111", "#FF6B35", "#A72A2A"];

    const [, setHeight] = useState(window.innerHeight);
    const [, setWidth] = useState(window.innerwidth);

    const updateWidthAndHeight = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    };

    React.useEffect(() => {
        window.addEventListener("resize", updateWidthAndHeight);
        return () => window.removeEventListener("resize", updateWidthAndHeight);
    });

    function getWeek(d) {
        let date = new Date(d);
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    }
    function getJour(nbr) {
        var offsetbeggin = new Date(state.year, state.month - 1, 0).getDay();
        var day = new Date(state.year, state.month - 1, nbr - offsetbeggin);
        return day;
    }

    if (state.shldFetch) {
        api.get("/")
            .then((response) => {
                if (response.status === 200) {
                    changeState({
                        "codeHash": response.data.code[0]["key"],
                        "user": response.data.user[0],
                    });
                    traiterEvent(response.data.event, response.data.todo, response.data.shared_events);
                }
            })
            .catch((err) => {
                if (err === "Error: Network Error") {
                    changeState({ "cantConnect": true });
                }
                if (err.response) {
                    if (err.response.status === 401) {
                        window.location.href = "/login";
                    }
                }
                console.log(err);
                //window.location.href = "./login";
            });
        changeState({ "shldFetch": false });
        //window.location.href = "./login"
    }
    const [reload, setReload] = useState(0);
    if (state["isCode"] && decryptCode(varCode, state.user) !== undefined) {
        if (state.codeHash === sha256(decryptCode(varCode, state.user))) {
            changeState({ "isCode": false });
            forceReload();
        }
    }

    function forceReload() {
        changeState({ "checkedMonth": [], "shldFetch": true, annim: "" });
    }

    function submitCode() {
        if (state.code !== "") {
            if (state.codeHash == sha256(state.code)) {
                if (state.isCodeSave) {
                    setCookie("code", encryptCode(state.code, state.user), {
                        path: "/",
                    });
                }
                sessionStorage.setItem("code", encryptCode(state.code, state.user));
                changeState({ "isCode": false });
                forceReload();
            }
            //todo afficher une erreur
        }
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

    function traiterEvent(list, todos, shared) {
        var tempList = list.sort((a, b) => a["start_date"] - b["start_date"]).concat(shared.sort((a, b) => a["start_date"] - b["start_date"]));
        var todoTemp = todos.sort((a, b) => a["date"] - b["date"]);
        let tempEvents = [];
        let eventToAdd = [];
        let tempRecu = [];
        let tempSto = {};
        if (decryptCode(varCode, state.user) != null) {
            if (sha256(decryptCode(varCode, state.user)) !== state.codeHash) {
                let temp = {};
                temp["Default Calendar"] = [true];
                changeState({ "isCode": true, "stockageCalendar": temp });
            } else {
                if (state.user.pub_key === "") {
                    let encrypt = new JSEncrypt({ default_key_size: 2048 });
                    let enc_private_key = AES.AES.encrypt(encrypt.getPrivateKey(), decryptCode(varCode, state.user)).toString();
                    let pub_key = encrypt.getPublicKey();
                    let data = {
                        "pub_key": pub_key,
                        "priv_key": enc_private_key,
                    };
                    api.post("/addRSAKey", data)
                        .then((res) => {})
                        .catch((err) => console.log(err));
                }
                for (let i = 0; i < tempList.length; i++) {
                    let code = parseInt(tempList[i]["color"]);
                    tempEvents.push(tempList[i]);
                    tempEvents[i]["color"] = colorCodeConv[code];
                    tempEvents[i]["nbr"] = i;
                    let fullCode = decryptCode(varCode, state.user);
                    fullCode = fullCode.concat(" ceci est du sel");
                    if (tempEvents[i]["version"] === 0) {
                        var bytes = AES.AES.decrypt(tempEvents[i]["event_name"], fullCode);
                        tempEvents[i]["event_name"] = bytes.toString(AES.enc.Utf8);
                        tempEvents[i]["calendar"] = AES.AES.decrypt(tempEvents[i]["calendar"], fullCode).toString(AES.enc.Utf8);
                        if (tempEvents[i]["start_date"] > 10) {
                            tempEvents[i]["start_date"] = tempEvents[i]["start_date"] - keyGen(fullCode);
                            tempEvents[i]["end_date"] = tempEvents[i]["end_date"] - keyGen(fullCode);
                        }
                    } else {
                        var cypher = new JSEncrypt({ default_key_size: 2048 });
                        cypher.setPrivateKey(AES.AES.decrypt(state.user.priv_key, decryptCode(varCode, state.user)).toString(AES.enc.Utf8));
                        let nameList = tempEvents[i]["event_name"].split(",");
                        let tmpCalLi = tempEvents[i]["calendar"].split(",");
                        for (let u = 0; u < nameList.length; u++) {
                            let temporary = cypher.decrypt(nameList[u]);
                            if (temporary !== null) {
                                tempEvents[i]["event_name"] = temporary;
                                tempEvents[i]["calendar"] = cypher.decrypt(tmpCalLi[u]);
                                if (tempEvents[i]["owner"] === state.user.email) {
                                    tempEvents[i]["isOwner"] = true;
                                } else {
                                    tempEvents[i]["isOwner"] = false;
                                }
                                break;
                            }
                        }

                        if (tempEvents[i]["start_date"] > 10) {
                            tempEvents[i]["start_date"] = tempEvents[i]["start_date"] - keyGen(tempEvents[i]["event_name"]);
                            tempEvents[i]["end_date"] = tempEvents[i]["end_date"] - keyGen(tempEvents[i]["event_name"]);
                        }
                    }

                    var objCalName = tempEvents[i]["calendar"];
                    if (tempSto[objCalName]) {
                        tempSto[objCalName].push(tempEvents[i]);
                    } else {
                        tempSto[objCalName] = [true, tempEvents[i]];
                    }
                    var TZoffset = new Date().getTimezoneOffset() * 60;
                    tempEvents[i]["start_date"] = tempEvents[i]["start_date"] - 2 * TZoffset;
                    tempEvents[i]["end_date"] = tempEvents[i]["end_date"] - 2 * TZoffset;
                    var recuNbr = tempEvents[i]["recurence"].toString();
                    let start = new Date(tempEvents[i]["start_date"] * 1000).setHours(0, 0, 0, 0);
                    let end = new Date(tempEvents[i]["end_date"] * 1000).setHours(0, 0, 0, 0);
                    if (end !== start) {
                        if (new Date(tempEvents[i]["end_date"] * 1000).getHours() === 0 && new Date(tempEvents[i]["end_date"] * 1000).getMinutes() === 0) {
                        } else {
                            tempEvents[i]["nbr-day"] = (new Date(end).getTime() - new Date(start).getTime()) / 86400000 + 1;
                            let nbr = (new Date(end).getTime() - new Date(start).getTime()) / 86400000 + 1;
                            let tpm = new Date(start).getDay();
                            if (tpm === 0) {
                                tpm = 7;
                            }
                            if (tempEvents[i]["nbr-day"] > 8 - tpm) {
                                tempEvents[i]["nbr-day"] = 8 - tpm;
                                nbr = nbr - (8 - tpm);
                                let k = 0;
                                while (nbr > 0) {
                                    let tmpEvt = JSON.parse(JSON.stringify(tempEvents[i]));
                                    tmpEvt["display_start"] = Math.floor(
                                        new Date(new Date(start).setDate(new Date(start).getDate() + (8 - tpm) + 7 * k)).getTime() / 1000
                                    );
                                    if (nbr >= 7) {
                                        tmpEvt["nbr-day"] = 7;
                                        nbr = nbr - 7;
                                    } else {
                                        tmpEvt["nbr-day"] = nbr;
                                        nbr = 0;
                                    }
                                    eventToAdd.push(tmpEvt);
                                    k++;
                                }
                            }
                        }
                    }
                    if (tempEvents[i]["recurence"] !== -1) {
                        tempEvents[i]["recurence_nbr"] = parseInt(recuNbr.split("")[1]);
                        tempEvents[i]["recurence_type"] = parseInt(recuNbr.split("")[0]);
                        tempRecu.push(tempEvents[i]);
                    }
                }
                for (let i = 0; i < todoTemp.length; i++) {
                    let code = parseInt(todoTemp[i]["color"]);
                    todoTemp[i]["color"] = colorCodeConv[code];
                    todoTemp[i]["nbr"] = i;
                    let fullCode = decryptCode(varCode, state.user);
                    fullCode = fullCode.concat(" ceci est du sel");
                    todoTemp[i]["name"] = AES.AES.decrypt(todoTemp[i]["name"], fullCode).toString(AES.enc.Utf8);
                    todoTemp[i]["calendar"] = AES.AES.decrypt(todoTemp[i]["calendar"], fullCode).toString(AES.enc.Utf8);
                    if (todoTemp[i]["date"] > 10) {
                        todoTemp[i]["date"] = todoTemp[i]["date"] - keyGen(fullCode);
                        var TZoffset = new Date().getTimezoneOffset() * 60;
                        todoTemp[i]["date"] = todoTemp[i]["date"] - TZoffset;
                    }
                }
                if (tempSto.length < 1) {
                    tempSto["Default Calendar"] = [true];
                }
                for (let i = 0; i < eventToAdd.length; i++) {
                    tempEvents.push(eventToAdd[i]);
                }
                changeState({
                    "checkedMonth": [],
                    "eventList": tempEvents,
                    "stockageCalendar": tempSto,
                    "recurentEvents": tempRecu,
                    "display": true,
                    "displayList": tempEvents,
                    "todoList": todoTemp,
                });
            }
        } else {
            changeState({ "isCode": true });
        }
    }

    var lastOfMonth;
    if (new Date(state.year, state.month, 0).getTime() >= getJour(36)) {
        lastOfMonth = getJour(42);
    } else if (new Date(state.year, state.month, 0).getTime() >= getJour(29)) {
        lastOfMonth = getJour(35);
    } else {
        lastOfMonth = getJour(28);
    }

    if (!state.checkedMonth.includes("" + state.year + " " + state.month) && state.recurentEvents.length > 0 && state.eventList.length > 0) {
        //let tempAdded = state.eventList.map((x) => x)
        let tempAdded = [];
        let tempCalSto = JSON.parse(JSON.stringify(state.stockageCalendar));
        let end_date = new Date(state.year, state.month, 0, 23, 59, 59).getTime() / 1000; //month n'est pas -1 car c'est le début du mois suivant
        let start_date = new Date(state.year, state.month - 1, 1).getTime() / 1000;
        for (let m = 0; m < state.recurentEvents.length; m++) {
            let eventRecu = state.recurentEvents[m];
            if (eventRecu["start_date"] > end_date) {
                continue;
            }
            if (eventRecu["recurenceEndType"] === 2) {
                if (eventRecu["recurenceEndNbr"] / 1000 < start_date) {
                    continue;
                }
            } else if (eventRecu["recurenceEndType"] === 1) {
                let recuTime = 0;
                switch (eventRecu["recurence_type"]) {
                    case 1:
                        recuTime = 86400;
                        break;
                    case 2:
                        recuTime = 604800;
                        break;
                    case 3:
                        recuTime = 22678400;
                        break;
                    case 4:
                        recuTime = 31622400;
                        break;
                    default:
                        recuTime = 0;
                        break;
                }
                recuTime = recuTime * eventRecu["recurence_nbr"];
                recuTime = recuTime * eventRecu["recurenceEndNbr"];
                if (eventRecu["end_date"] + recuTime + 86400 < start_date) {
                    continue;
                }
            }
            let j = 0;
            let i;
            let tmpDateS;
            let tmpDateE;
            switch (eventRecu["recurence_type"]) {
                case 1:
                    i = 0;
                    tmpDateS = new Date(eventRecu["start_date"] * 1000);
                    tmpDateE = new Date(eventRecu["end_date"] * 1000);
                    tempAdded.push(JSON.parse(JSON.stringify(eventRecu)));
                    while (j === 0) {
                        let tmpEvnt = eventRecu;
                        tmpDateS.setDate(tmpDateS.getDate() + eventRecu["recurence_nbr"]);
                        tmpDateE.setDate(tmpDateE.getDate() + eventRecu["recurence_nbr"]);
                        let shldPush = true;
                        /*if (tmpEvnt['recurenceEndType'] === 1) {
                            if (i > tmpEvnt['recurenceEndNbr']) {
                                j = 1
                                shldPush = false
                            }
                        }*/
                        if (tmpEvnt["recurenceEndType"] > 0) {
                            if (tmpDateS.getTime() / 1000 >= tmpEvnt["recurenceEndNbr"] / 1000) {
                                j = 1;
                                shldPush = false;
                            }
                        } else if (tmpEvnt["recurenceEndType"] === 0) {
                            //todo ajouter && day > 7
                            if (tmpDateS.getTime() > lastOfMonth.getTime()) {
                                j = 1;
                                shldPush = false;
                            }
                        }
                        tmpEvnt["start_date"] = tmpDateS.getTime() / 1000;
                        tmpEvnt["end_date"] = tmpDateE.getTime() / 1000;
                        tmpEvnt["nbr"] = state.eventList.length + tmpEvnt["start_date"];
                        //les intervalels grandissent bien trop vite + enlever le blockage de l'affichage des récu
                        //console.log(tmpEvnt) //celui la a la bonne start date
                        if (shldPush) {
                            tempAdded.push(JSON.parse(JSON.stringify(tmpEvnt)));
                            tempCalSto[eventRecu["calendar"]].push(JSON.parse(JSON.stringify(eventRecu)));
                        }
                        if (i > 50) {
                            j = 1;
                        }
                        i++;
                    }
                    break;
                case 2:
                    i = 0;
                    tmpDateS = new Date(eventRecu["start_date"] * 1000);
                    tmpDateE = new Date(eventRecu["end_date"] * 1000);
                    tempAdded.push(JSON.parse(JSON.stringify(eventRecu)));
                    while (j === 0) {
                        let tmpEvnt = eventRecu;
                        tmpDateS.setDate(tmpDateS.getDate() + eventRecu["recurence_nbr"] * 7);
                        tmpDateE.setDate(tmpDateE.getDate() + eventRecu["recurence_nbr"] * 7);
                        let shldPush = true;
                        /*if (tmpEvnt['recurenceEndType'] === 1) {
                            if (i > tmpEvnt['recurenceEndNbr']) {
                                j = 1
                                shldPush = false
                            }
                        }*/
                        if (tmpEvnt["recurenceEndType"] > 0) {
                            if (tmpDateS.getTime() / 1000 >= tmpEvnt["recurenceEndNbr"] / 1000) {
                                j = 1;
                                shldPush = false;
                            }
                        } else if (tmpEvnt["recurenceEndType"] === 0) {
                            //todo ajouter && day > 7
                            if (tmpDateS.getTime() > lastOfMonth.getTime()) {
                                j = 1;
                                shldPush = false;
                            }
                        }
                        tmpEvnt["start_date"] = tmpDateS.getTime() / 1000;
                        tmpEvnt["end_date"] = tmpDateE.getTime() / 1000;
                        tmpEvnt["nbr"] = state.eventList.length + tmpEvnt["start_date"];
                        //les intervalels grandissent bien trop vite + enlever le blockage de l'affichage des récu
                        //console.log(tmpEvnt) //celui la a la bonne start date
                        if (shldPush) {
                            tempAdded.push(JSON.parse(JSON.stringify(tmpEvnt)));
                            tempCalSto[eventRecu["calendar"]].push(JSON.parse(JSON.stringify(eventRecu)));
                        }
                        if (i > 50) {
                            j = 1;
                        }
                        i++;
                    }
                    break;
                case 3:
                    i = 0;
                    tmpDateS = new Date(eventRecu["start_date"] * 1000);
                    tmpDateE = new Date(eventRecu["end_date"] * 1000);
                    tempAdded.push(JSON.parse(JSON.stringify(eventRecu)));
                    while (j === 0) {
                        let tmpEvnt = eventRecu;
                        tmpDateS.setMonth(tmpDateS.getMonth() + eventRecu["recurence_nbr"]);
                        tmpDateE.setMonth(tmpDateE.getMonth() + eventRecu["recurence_nbr"]);
                        let shldPush = true;
                        /*if (tmpEvnt['recurenceEndType'] === 1) {
                            if (i > tmpEvnt['recurenceEndNbr']) {
                                j = 1
                                shldPush = false
                            }
                        }*/
                        if (tmpEvnt["recurenceEndType"] > 0) {
                            if (tmpDateS.getTime() / 1000 >= tmpEvnt["recurenceEndNbr"] / 1000) {
                                j = 1;
                                shldPush = false;
                            }
                        } else if (tmpEvnt["recurenceEndType"] === 0) {
                            //todo ajouter && day > 7
                            if (tmpDateS.getTime() > lastOfMonth.getTime()) {
                                j = 1;
                                shldPush = false;
                            }
                        }
                        tmpEvnt["start_date"] = tmpDateS.getTime() / 1000;
                        tmpEvnt["end_date"] = tmpDateE.getTime() / 1000;
                        tmpEvnt["nbr"] = state.eventList.length + tmpEvnt["start_date"];
                        //les intervalels grandissent bien trop vite + enlever le blockage de l'affichage des récu
                        //console.log(tmpEvnt) //celui la a la bonne start date
                        if (shldPush) {
                            tempAdded.push(JSON.parse(JSON.stringify(tmpEvnt)));
                            tempCalSto[eventRecu["calendar"]].push(JSON.parse(JSON.stringify(eventRecu)));
                        }
                        if (i > 50) {
                            j = 1;
                        }
                        i++;
                    }
                    break;
                case 4:
                    i = 0;
                    tmpDateS = new Date(eventRecu["start_date"] * 1000);
                    tmpDateE = new Date(eventRecu["end_date"] * 1000);
                    tempAdded.push(JSON.parse(JSON.stringify(eventRecu)));
                    while (j === 0) {
                        let tmpEvnt = eventRecu;
                        tmpDateS.setFullYear(tmpDateS.getFullYear() + eventRecu["recurence_nbr"]);
                        tmpDateE.setFullYear(tmpDateE.getFullYear() + eventRecu["recurence_nbr"]);
                        let shldPush = true;
                        /*if (tmpEvnt['recurenceEndType'] === 1) {
                            if (i > tmpEvnt['recurenceEndNbr']) {
                                j = 1
                                shldPush = false
                            }
                        }*/
                        if (tmpEvnt["recurenceEndType"] > 0) {
                            if (tmpDateS.getTime() / 1000 >= tmpEvnt["recurenceEndNbr"] / 1000) {
                                j = 1;
                                shldPush = false;
                            }
                        } else if (tmpEvnt["recurenceEndType"] === 0) {
                            //todo ajouter && day > 7
                            if (tmpDateS.getTime() > lastOfMonth.getTime()) {
                                j = 1;
                                shldPush = false;
                            }
                        }
                        tmpEvnt["start_date"] = tmpDateS.getTime() / 1000;
                        tmpEvnt["end_date"] = tmpDateE.getTime() / 1000;
                        tmpEvnt["nbr"] = state.eventList.length + tmpEvnt["start_date"];
                        //les intervalels grandissent bien trop vite + enlever le blockage de l'affichage des récu
                        //console.log(tmpEvnt) //celui la a la bonne start date
                        if (shldPush) {
                            tempAdded.push(JSON.parse(JSON.stringify(tmpEvnt)));
                            tempCalSto[eventRecu["calendar"]].push(JSON.parse(JSON.stringify(eventRecu)));
                        }
                        if (i > 50) {
                            j = 1;
                        }
                        i++;
                    }
                    break;
                default:
                    break;
            }
            //puis faire les différents check
        }
        let tmpArr = state.checkedMonth.map((x) => x);
        tmpArr.push("" + state.year + " " + state.month);
        let toAdd = state.eventList.concat(tempAdded);
        changeState({
            "checkedMonth": tmpArr,
            "eventList": toAdd,
            "displayList": toAdd,
            "stockageCalendar": tempCalSto,
        });
    }

    function calendarSelecSwitch(name) {
        let temp = state.stockageCalendar;
        state.stockageCalendar[name][0] = state.stockageCalendar[name][0] ? false : true;
        let tempList = [];
        for (let name in state.stockageCalendar) {
            if (state.stockageCalendar[name][0]) {
                tempList = tempList.concat(state.stockageCalendar[name].slice(1));
            }
        }
        changeState({ "stockageCalendar": temp, "displayList": tempList });
        setReload(reload + 1);
    }

    function generateWeeklyList() {
        let total = state.displayList;
        return total.filter((valeur) => {
            if (valeur.start_date > getDateOfISOWeek().getTime() / 1000 && valeur.start_date < lastOfDay(6).getTime() / 1000) return true;
            if (valeur.end_date > getDateOfISOWeek().getTime() / 1000 && valeur.end_date < lastOfDay(6).getTime() / 1000) return true;
            return false;
        });
    }

    function generateCalendarTable() {
        let calendarList = [];
        for (let i = 0; i < state.eventList.length; i++) {
            if (calendarList.includes(state.eventList[i]["calendar"])) {
            } else {
                calendarList.push(state.eventList[i]["calendar"]);
            }
        }
        if (calendarList.length < 1) {
            calendarList.push("Default Calendar");
        }
        return calendarList;
    }

    function switchMonWee() {
        if (state.isWeekly) {
            changeState({ "isWeekly": false, "annim": "" });
        } else {
            changeState({ "isWeekly": true, "annim": "" });
        }
    }

    function ajouterEvent(event) {
        changeState({ "annim": "" });
        forceReload();
    }

    // var weeklyEventList = eventList.filter(valeur => {
    //     if (valeur.start_date > getDateOfISOWeek().getTime() / 1000 && valeur.start_date < lastOfDay(6).getTime() / 1000) return true;
    //     if (valeur.end_date > getDateOfISOWeek().getTime() / 1000 && valeur.end_date < lastOfDay(6).getTime() / 1000) return true;
    // })

    function nextWeek() {
        let tempMonth = state.month - 1;
        let temp = new Date(state.year, tempMonth, getDateOfISOWeek().getDate() + 7);
        changeState({
            "year": temp.getFullYear(),
            "week": getWeek(temp),
            month: temp.getMonth() + 1,
            "annim": "right-appear",
        });
    }
    function prevWeek() {
        let tempMonth = state.month - 1;
        let temp = new Date(state.year, tempMonth, getDateOfISOWeek().getDate() - 7);
        changeState({
            "year": temp.getFullYear(),
            "week": getWeek(temp),
            month: temp.getMonth() + 1,
            "annim": "right-appear",
        });
    }
    function nextMonth() {
        let temp = new Date(state.year, state.month, 1);
        changeState({
            "year": temp.getFullYear(),
            "week": getWeek(temp),
            month: temp.getMonth() + 1,
            "annim": "right-appear",
        });
    }
    function prevMonth() {
        let temp = new Date(state.year, state.month - 2, 1);
        changeState({
            "year": temp.getFullYear(),
            "week": getWeek(temp),
            month: temp.getMonth() + 1,
            "annim": "right-appear",
        });
    }

    function getDateOfISOWeek() {
        var simple = new Date(state.year, 0, 1 + (state.week - 1) * 7);
        var dow = simple.getDay();
        var ISOweekStart = simple;
        if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }
    function lastOfDay(nbr) {
        let mon = getDateOfISOWeek();
        return new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + nbr, 23, 59, 59);
    }

    // function getMoinsJour(date) {
    //     var day = new Date(year, month, 0).getDay();
    //     if (day === 0) {
    //         day = 7
    //     }
    //     return date.getDate() + day
    // }
    // function getJour(nbr) {
    //     var offsetbeggin = new Date(year, month - 1, 0).getDay();
    //     var day = new Date(year, month - 1, nbr - offsetbeggin)
    //     return (day);
    // }
    // function rowToJour(nbr) {
    //     let mon = getDateOfISOWeek()
    //     return new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + nbr)
    // }

    // <MiniCalendar annim={annim} eventList={state.displayList} isSele={isWeekly} month={month} year={year} week={week} nextMonth={() => nextMonth()} prevMonth={() => prevMonth()}/>
    // <CalendarSelect reload={() => forceReload()} stockageCalendar={stockageCalendar} calendarSelecSwitch={(x) => calendarSelecSwitch(x)} calendarList={generateCalendarTable()} ajouterEvent={(x) => ajouterEvent(x)}/>
    // <NextEvents eventList={eventList} reload={() => forceReload()}/>

    // <Today eventList={state.displayList} reload={() => forceReload()}/>

    const mql_large = window.matchMedia("(min-width: 1610px)");
    const mql_mobile = window.matchMedia("(max-width: 1270px)");

    let large = mql_large.matches;
    let mobile = mql_mobile.matches;

    if (state.isCode) {
        return (
            <>
                <Header user={state.user} />
                <section
                    className="main-section"
                    style={large ? { gridTemplateColumns: "300px 3fr 255px" } : mobile ? { gridTemplateColumns: "3fr" } : { gridTemplateColumns: "300px 3fr" }}>
                    <div className="code-popup-container">
                        <div className="code-popup true-code-popup">
                            <h1>There is a problem !</h1>
                            <p>We need your code to access the events !</p>
                            <div className="code-in-line">
                                <input className="input-contained" type="password" onChange={(e) => changeState({ "code": e.target.value })} autoFocus />
                                <Button onClick={() => submitCode()} full txt="Submit" />
                            </div>
                            <Checkbox
                                checked={state.isCodeSave}
                                changement={(x) => {
                                    changeState({ "isCodeSave": x });
                                }}
                                txt="Remember me ?"
                                color="#3581b8"
                            />
                        </div>
                    </div>
                </section>
            </>
        );
    }

    let calHeight = document.getElementsByClassName("monthly-calendar")[0];
    if (calHeight === undefined) {
        calHeight = "100%";
    } else {
        calHeight = calHeight.clientHeight;
    }
    let calSelHeight = document.getElementsByClassName("calendar-select")[0];
    if (calSelHeight === undefined) {
        calSelHeight = "100px";
    } else {
        calSelHeight = calSelHeight.clientHeight;
    }
    let miniCalHeight = document.getElementsByClassName("mini-calendar")[0];
    if (miniCalHeight === undefined) {
        miniCalHeight = "100px";
    } else {
        miniCalHeight = miniCalHeight.clientHeight;
    }

    let nbrCal = Object.keys(state.stockageCalendar).length;
    if (nbrCal === 0) {
        nbrCal = 1;
    }
    let heightNextEvent = calHeight - calSelHeight - miniCalHeight - 60;

    if (isNaN(heightNextEvent)) {
        heightNextEvent = "100%";
    }

    window.onkeydown = function (e) {
        if (e.keyCode === 37) {
            if (state.isWeekly) {
                prevWeek();
            } else {
                prevMonth();
            }
        } else if (e.keyCode === 39) {
            if (state.isWeekly) {
                nextWeek();
            } else {
                nextMonth();
            }
        }
    };

    return (
        <>
            <Header user={state.user} calendarList={() => generateCalendarTable()} forceReload={(x) => forceReload()} />
            {state.display ? (
                <section
                    className="main-section"
                    style={large ? { gridTemplateColumns: "300px 3fr 255px" } : mobile ? { gridTemplateColumns: "3fr" } : { gridTemplateColumns: "300px 3fr" }}>
                    {!mobile ? (
                        <div className="left-section" style={{ height: calHeight + "px" }}>
                            <MiniCalendar
                                annim={state.annim}
                                eventList={state.displayList}
                                isSele={state.isWeekly}
                                month={state.month}
                                year={state.year}
                                week={state.week}
                                nextMonth={() => nextMonth()}
                                prevMonth={() => prevMonth()}
                            />
                            <CalendarSelect
                                reload={() => forceReload()}
                                stockageCalendar={state.stockageCalendar}
                                calendarSelecSwitch={(x) => calendarSelecSwitch(x)}
                                calendarList={generateCalendarTable()}
                                ajouterEvent={(x) => ajouterEvent(x)}
                                user={state.user}
                            />
                            <Todo
                                user={state.user}
                                calendarList={generateCalendarTable()}
                                todoList={state.todoList}
                                height={heightNextEvent}
                                reload={() => forceReload()}
                            />
                            {/*<NextEvents height={heightNextEvent} eventList={state.eventList} reload={() => forceReload()} />*/}
                        </div>
                    ) : null}
                    <div className={mobile ? "right-section right-section-mobile" : "right-section"}>
                        {state.isWeekly ? (
                            <WeeklyCalendar
                                recu={state.recurentEvents}
                                user={state.user}
                                mobile={mobile}
                                reload={() => forceReload()}
                                setAnnim={(x) => changeState({ "annim": x })}
                                ajouterEvent={(x) => ajouterEvent(x)}
                                calendarList={generateCalendarTable()}
                                switch={() => switchMonWee()}
                                nextWeek={() => nextWeek()}
                                prevWeek={() => prevWeek()}
                                year={state.year}
                                week={state.week}
                                month={state.month}
                                eventList={generateWeeklyList()}
                                fullList={state.eventList}
                                setEdit={(x) => changeState({ "isEdit": x })}
                            />
                        ) : (
                            <MonthlyCalendar
                                recu={state.recurentEvents}
                                user={state.user}
                                mobile={mobile}
                                reload={() => forceReload()}
                                setAnnim={(x) => changeState({ "annim": x })}
                                annim={state.annim}
                                ajouterEvent={(x) => ajouterEvent(x)}
                                switch={() => switchMonWee()}
                                calendarList={generateCalendarTable()}
                                nextMonth={() => nextMonth()}
                                prevMonth={() => prevMonth()}
                                month={state.month}
                                year={state.year}
                                eventList={state.displayList}
                                setEdit={(x) => changeState({ "isEdit": x })}
                            />
                        )}
                    </div>
                    {/*large ? <Today eventList={state.displayList} reload={() => forceReload()} /> : null*/}
                    {large ? <Planning month={state.month} year={state.year} eventList={state.eventList} reload={() => forceReload()} /> : null}
                    {/*mobile ? (
                        <>
                            <Planning mobile eventList={state.eventList} reload={() => forceReload()} />
                            { <CalendarSelect mobile reload={() => forceReload()} stockageCalendar={stockageCalendar} calendarSelecSwitch={(x) => calendarSelecSwitch(x)} calendarList={generateCalendarTable()} ajouterEvent={(x) => ajouterEvent(x)} /> }
                        </>
                    ) : null*/}
                    {state.isEdit !== null ? (
                        <EditPopup
                            user={state.user}
                            event={state.isEdit}
                            setisAdd={() => changeState({ "isEdit": null })}
                            calendarList={() => generateCalendarTable()}
                            reload={() => forceReload()}
                        />
                    ) : (
                        <></>
                    )}
                    {state.user.verified || state.bypassVerif ? null : (
                        <>
                            <div className="code-popup-container">
                                <div className="code-popup verif-popup">
                                    <h1>Verify your account !</h1>
                                    <p>We've sent you a mail containing a link to verify your account.</p>
                                    <p>
                                        If you don't receive it, check your spam folder. We can also{" "}
                                        <a
                                            style={{ color: state.resendDisplay ? "" : "var(--dark-color)", cursor: state.resendDisplay ? "pointer" : "not-allowed" }}
                                            onClick={() => {
                                                changeState({ "resendDisplay": false });
                                                api.get("/re-verif")
                                                    .then((res) => {})
                                                    .catch((err) => {
                                                        console.log(err);
                                                    });
                                            }}>
                                            resend it
                                        </a>
                                    </p>
                                    <i
                                        className="fas fa-times verif-cross"
                                        onClick={() => {
                                            changeState({ "bypassVerif": true });
                                        }}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {state.isCode ? (
                        <div className="code-popup-container">
                            <div className="code-popup true-code-popup">
                                <h1>There is a problem !</h1>
                                <p>We need your code to access the events !</p>
                                <div className="code-in-line">
                                    <input
                                        className="input-contained"
                                        type="password"
                                        onChange={(e) =>
                                            changeState({
                                                "code": e.target.value,
                                            })
                                        }
                                        autoFocus
                                    />
                                    <Button onClick={() => submitCode()} full txt="Submit" />
                                </div>
                                <Checkbox
                                    checked={state.isCodeSave}
                                    changement={(x) => {
                                        changeState({ "isCodeSave": x });
                                    }}
                                    txt="Remember me ?"
                                    color="#3581b8"
                                />
                            </div>
                        </div>
                    ) : null}
                </section>
            ) : state.cantConnect ? (
                <div className="cant-co-container code-popup-container">
                    <div className="cant-co-popup code-popup">
                        <h1>There is a problem !</h1>
                        <p>
                            Unfortunately, we can't reach the server, this might be a problem on your side but it's more likely a problem on our side, we're absolutely
                            sorry that this happen and are currently working of fixing it, please try again later.
                        </p>
                        {false ? <Button full txt="Retry" onClick={() => window.location.reload(true)} /> : null}
                    </div>
                </div>
            ) : (
                <div className="loading-container">
                    <div className="loader"></div>
                </div>
            )}
        </>
    );
};
