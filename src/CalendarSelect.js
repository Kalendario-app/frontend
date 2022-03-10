import React from "react";
import { Checkbox } from "./Checkbox";
import { useState } from "react";
import { Button } from "./Button";
import { api, decryptCode } from "./Main";
import { useCookies } from "react-cookie";
import AES from "crypto-js";
import { sha256 } from "js-sha256";

export const CalendarSelect = (props) => {
    const [cookies] = useCookies();

    const colorCodeConv = ["#3581B8", "#5BA94C", "#E4C111", "#FF6B35", "#A72A2A"];

    var varCode = "";

    if (cookies.code !== undefined) {
        varCode = cookies.code;
    } else if (sessionStorage.getItem("code") !== null) {
        varCode = sessionStorage.getItem("code");
    } else {
        varCode = "";
    }

    const [isAdd, setIsAdd] = useState(false);
    const [txt, setTxt] = useState("");
    // const [reload, setReload] = useState(0)
    const [isDelete, setIsDelete] = useState("");
    const [isDefaultChecked, setIsDefaultChecked] = useState(true);
    const [isEdit, setIsEdit] = useState(-1);
    const [editTxt, setEditTxt] = useState("");
    const [oldName, setOldName] = useState("");

    var keyList = [];

    function addCalendar() {
        var code = decryptCode(varCode, props.user) + " ceci est du sel";
        if (txt === "") {
            return;
        }
        let data = {
            "event_name": AES.AES.encrypt(txt, code).toString(),
            "start_date": 0,
            "end_date": 1,
            "color": 0,
            "full": true,
            "calendar": AES.AES.encrypt(txt, code).toString(),
            "recurence": -1,
            "recurenceEndType": 0,
            "recurenceEndNbr": 0,
        };
        api.post("/create", data).then((res) => {
            props.ajouterEvent();
        });
        setIsAdd(false);
        setTxt("");
    }

    function calFilter(event) {
        if (event["start_date"] > 86400) {
            return true;
        } else {
            return false;
        }
    }

    window.onkeydown = function (e) {
        if (e.keyCode === 13 && isEdit !== -1) {
            submitEdit();
        }
    };

    function deleteCalendar() {
        var eventList = props.stockageCalendar[isDelete].map((x) => x);
        eventList.shift();
        var count = 0;
        eventList.map((x) => {
            api.get("eventDelete?key=" + x["key"]).then((response) => {
                if (response.status === 200) {
                    count++;
                }
                if (count === eventList.length) {
                    props.reload();
                }
            });
            return null;
        });
        setIsDelete("");
    }

    for (var key in props.stockageCalendar) {
        keyList.push(key);
    }

    function edit(y) {
        setIsEdit(y);
        setEditTxt(keyList[y]);
        setOldName(keyList[y]);
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

    function submitEdit() {
        var code = decryptCode(varCode, props.user) + " ceci est du sel";
        if (editTxt === oldName || editTxt === "") {
            setIsEdit(-1);
            setEditTxt("");
            setOldName("");
            return;
        }

        //let data = "";
        let tmpArr = props.stockageCalendar[oldName].slice(1);
        let results = 0;
        var TZoffset = new Date().getTimezoneOffset() * 60;
        tmpArr.forEach((x) => {
            api.post("/editEvent", {
                "key": x["key"],
                "event_name": AES.AES.encrypt(x["event_name"], code).toString(),
                "start_date": new Date(x["start_date"] * 1000).getTime() / 1000 + keyGen(code) + TZoffset,
                "end_date": new Date(x["end_date"] * 1000).getTime() / 1000 + keyGen(code) + TZoffset,
                "color": colorCodeConv.indexOf(x["color"]),
                "full": x["full"],
                "calendar": AES.AES.encrypt(editTxt, code).toString(),
                "recurence": x["recurence"],
                "recurenceEndType": x["recurenceEndType"],
                "recurenceEndNbr": x["recurenceEndNbr"],
            })
                .then((res) => {
                    if (res.status === 202) {
                        results += 1;
                    }
                    if (results === tmpArr.length) {
                        props.reload();
                        setIsEdit(-1);
                    }
                })
                .catch((err) => {
                    results = false;
                });
        });
        /*
        api.post("editCalendar", JSON.stringify({ "old": data, "new": AES.AES.encrypt(editTxt, code).toString() })).then((response) => {
            if (response.status === 202) {
                props.reload();
                setIsEdit(-1);
            } else {
                setIsEdit(-1);
            }
        });*/
    }

    if (Object.keys(props.stockageCalendar).length > 0) {
        return (
            <div className="calendar-select">
                {isDelete !== "" ? (
                    <div className="calendar-delete-container" onClick={() => setIsDelete("")}>
                        <div className="calendar-delete-popup" onClick={(e) => e.stopPropagation()}>
                            <h2>Delete Event</h2>
                            <p>
                                Are you sure to delete {isDelete}? It will destroy every event inside of it! (It has{" "}
                                {props.stockageCalendar[isDelete].filter((x) => calFilter(x)).length} event
                                {props.stockageCalendar[isDelete].length < 2 ? null : "s"} !)
                            </p>
                            <div className="calendar-delete-btn">
                                <Button full txt="Cancel" first onClick={() => setIsDelete("")} />
                                <Button full txt="Delete" last onClick={() => deleteCalendar()} />
                            </div>
                        </div>
                    </div>
                ) : null}
                <div className="calendar-select-top">
                    <h2>My Calendars</h2>
                    <h2 onClick={() => setIsAdd(!isAdd)} id="calendar-add">
                        +
                    </h2>
                </div>
                <div className="container-select-calendar">
                    {isAdd ? (
                        <div className="cal-edit">
                            <input onChange={(e) => setTxt(e.target.value)} className="input-open cal-edit-input" placeholder={"Calendar name"} />
                            <div className="cal-edit-btns">
                                <Button txt="Cancel" onClick={() => setIsAdd(false)} />
                                <Button onClick={() => addCalendar()} full txt={"Add"} />
                            </div>
                        </div>
                    ) : null}
                    {keyList.map((x, y) =>
                        isEdit !== y ? (
                            <div
                                key={x}
                                className="calendar-select-item"
                                onClick={() => {
                                    props.calendarSelecSwitch(x);
                                }}>
                                <Checkbox checked={props.stockageCalendar[x][0]} txt={x} changement={() => props.calendarSelecSwitch(x)} />
                                <div className="calendar-select-option">
                                    <i
                                        className="fas fa-pen"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            edit(y);
                                        }}></i>
                                    <i
                                        className="fas fa-trash"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDelete(x);
                                        }}></i>
                                </div>
                            </div>
                        ) : (
                            <div className="cal-edit">
                                <input className="input-open cal-edit-input" value={editTxt} onChange={(e) => setEditTxt(e.target.value)} />
                                <div className="cal-edit-btns">
                                    <Button txt="Cancel" onClick={() => setIsEdit(-1)} />
                                    <Button
                                        full
                                        txt="Save"
                                        onClick={() => {
                                            submitEdit();
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    } else {
        return (
            <div className="calendar-select">
                <div className="calendar-select-top">
                    <h2>My calendars</h2>
                    <h2 onClick={() => setIsAdd(!isAdd)} id="calendar-add">
                        +
                    </h2>
                </div>
                <div className="container-select-calendar">
                    {isAdd ? (
                        <div className="calendar-add-div">
                            <input onChange={(e) => setTxt(e.target.value)} className="input-open cal-edit-input" placeholder={"Calendar name"} />
                            <Button onClick={() => addCalendar()} full txt={"Add"} />
                        </div>
                    ) : null}
                    <Checkbox
                        checked={isDefaultChecked}
                        txt="Default Calendar"
                        changement={() => {
                            setIsDefaultChecked(!isDefaultChecked);
                        }}
                    />
                </div>
            </div>
        );
    }
};
