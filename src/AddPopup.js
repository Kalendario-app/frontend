/* eslint-disable */
import { useEffect, useState } from "react";
import { Checkbox } from "./Checkbox";
import { Button } from "./Button";
import { api, decryptCode } from "./Main";
import axios from "axios";
import AES from "crypto-js";
import { useCookies } from "react-cookie";
import { sha256 } from "js-sha256";
import { TimeInput } from "./TimeInput";

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export const AddPopup = (props) => {
    const [cookies] = useCookies();

    var varCode = "";

    /*if (cookies.code !== undefined) {
        varCode = cookies.code;
    } else*/ if (sessionStorage.getItem("code") !== null) {
        varCode = sessionStorage.getItem("code");
    } else {
        varCode = "";
    }

    const [calendarNbr, setCalendarNbr] = useState(0);
    const [color, setcolor] = useState(0);

    const colorConv = ["Blue", "Green", "Yellow", "Orange", "Red"];
    const colorCodeConv = ["#3581B8", "#5BA94C", "#E4C111", "#FF6B35", "#A72A2A"];
    const txtColCode = ["var(--white-2)", "", "", "var(--white-2)", "var(--white-2)"];
    const letterNum = {
        "A": 1,
        "B": 2,
        "C": 3,
        "D": 4,
        "E": 5,
        "F": 6,
        "G": 7,
        "H": 8,
        "I": 9,
        "J": 10,
        "K": 11,
        "L": 12,
        "M": 13,
        "N": 14,
        "O": 15,
        "P": 16,
        "Q": 17,
        "R": 18,
        "S": 19,
        "T": 20,
        "U": 21,
        "V": 22,
        "W": 23,
        "X": 24,
        "Y": 25,
        "Z": 26,
        "a": 27,
        "b": 28,
        "c": 29,
        "d": 30,
        "e": 31,
        "f": 32,
        "g": 33,
        "h": 34,
        "i": 35,
        "j": 36,
        "k": 37,
        "l": 38,
        "m": 39,
        "n": 40,
        "o": 41,
        "p": 42,
        "q": 43,
        "r": 44,
        "s": 45,
        "t": 46,
        "u": 47,
        "v": 48,
        "w": 49,
        "x": 50,
        "y": 51,
        "z": 52,
    };
    // const dayConv = [
    //     'Sunday',
    //     'Monday',
    //     'Tuesday',
    //     'Wednesday',
    //     'Thursday',
    //     'Friday',
    //     'Saturday',
    // ]
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

    const [name, setName] = useState("");
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date(new Date().getTime() + 3600));
    const [fullDay, setFullDay] = useState(false);
    const [dateChanged, setDateChanged] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [dateError, setDateError] = useState(false);
    const [startEndError, setStartEndError] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [recurence, setRecurence] = useState(1);
    const [recurenceNbr, setRecurenceNbr] = useState(1);
    const [recurenceEndType, setRecurenceEndType] = useState(0);
    const [recurenceEndNbr, setRecurenceEndNbr] = useState(0);
    const [canSub, setCanSub] = useState(true);
    const [endChanged, setEndChanged] = useState(false);

    const [isDisplayPop, setIsDisplayPop] = useState(false);

    const [isAdvenced, setIsAdvenced] = useState(false);
    const [advencedChanged, setAdvencedChanged] = useState(false);

    const [guestList, setGuestList] = useState([]);
    const [guestSearchList, setGuestSearchList] = useState([]);

    const [guestSearIn, setGuestSearIn] = useState("");

    const [, reload] = useState(0);

    if (recurenceEndType == 2) {
        if (new Date(recurenceEndNbr).getTime() < new Date(end).getTime()) {
            setRecurenceEndNbr(
                new Date(new Date(new Date(end).getFullYear(), new Date(end).getMonth(), new Date(end).getDate() + 2).getTime()).toISOString().split("T")[0]
            );
        }
    }
    if (recurenceEndType == 1) {
        if (parseInt(recurenceEndNbr) < 2) {
            setRecurenceEndNbr(2);
        }
    }

    function generateRepeat() {
        if (isRepeat) {
            return parseInt(recurence) * 10 + parseInt(recurenceNbr);
        } else {
            return -1;
        }
    }

    function generateRecurenceEndNbr() {
        if (recurenceEndType == 2) {
            return new Date(recurenceEndNbr).getTime();
        } else if (recurenceEndType == 1) {
            let dateEnd = new Date(start);
            switch (recurence) {
                case 1:
                    dateEnd.setDate(dateEnd.getDate() + recurenceNbr * (recurenceEndNbr - 1));
                    break;
                case 2:
                    dateEnd.setDate(dateEnd.getDate() + recurenceNbr * (recurenceEndNbr - 1) * 7);
                    break;
                case 3:
                    dateEnd.setMonth(dateEnd.getMonth() + recurenceNbr * (recurenceEndNbr - 1));
                    break;
                case 4:
                    dateEnd.setFullYear(dateEnd.getFullYear() + recurenceNbr * (recurenceEndNbr - 1));
                    break;
            }
            return dateEnd.getTime();
        } else {
            return -1;
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

    function searchStringInArray(str, strArray, already) {
        let listVal = [];
        for (var j = 0; j < strArray.length; j++) {
            if (strArray[j].match(str) && !already.includes(strArray[j])) {
                listVal.push(strArray[j]);
            }
        }
        return listVal;
    }

    function submitData() {
        var TZoffset = new Date().getTimezoneOffset() * 60;
        var tempCalendar;
        setNameError(false);
        setStartEndError(false);
        setDateError(false);
        if (fullDay) {
            let tempStart = new Date(start);
            setStart(toHtmlDate(new Date(tempStart.getFullYear(), tempStart.getMonth() + 1, tempStart.getDate()), true));
            let tempEnd = new Date(end);
            setEnd(toHtmlDate(new Date(tempEnd.getFullYear(), tempEnd.getMonth() + 1, tempEnd.getDate(), 23, 59, 59), true));
            if (recurence === 5) {
                setRecurence(-1);
            }
        }
        if (new Date(end) > new Date(start) && name !== "") {
            let code = decryptCode(varCode, props.user);
            var encrypted;
            code = code.concat(" ceci est du sel");
            if (props.calendarList()[calendarNbr]) {
                tempCalendar = props.calendarList()[calendarNbr];
            } else {
                tempCalendar = "Default Calendar";
            }
            encrypted = AES.AES.encrypt(name, code).toString();
            let data = {
                "event_name": encrypted,
                "start_date": new Date(start).getTime() / 1000 + TZoffset + keyGen(code),
                "end_date": new Date(end).getTime() / 1000 + TZoffset + keyGen(code),
                "color": color,
                "full": true,
                "calendar": AES.AES.encrypt(tempCalendar, code).toString(),
                "recurence": generateRepeat(),
                "recurenceEndType": parseInt(recurenceEndType),
                "recurenceEndNbr": generateRecurenceEndNbr(),
            };
            api.post("/create", data).then((res) => {
                props.setisAdd(false);
                props.ajouterEvent();
            });
        } else if (fullDay && end === start && name !== "") {
            let code = decryptCode(varCode, props.user);
            code = code.concat(" ceci est du sel");
            if (props.calendarList()[calendarNbr]) {
                tempCalendar = props.calendarList()[calendarNbr];
            } else {
                tempCalendar = "Default Calendar";
            }
            let tempCustEnd = new Date(end);
            tempCustEnd.setHours(tempCustEnd.getHours() + 23);
            tempCustEnd.setMinutes(59);
            tempCustEnd.setSeconds(59);
            encrypted = AES.AES.encrypt(name, code).toString();
            let data = {
                "event_name": encrypted,
                "start_date": new Date(start).getTime() / 1000 + 2 * TZoffset + keyGen(code),
                "end_date": new Date(tempCustEnd).getTime() / 1000 + 2 * TZoffset + keyGen(code),
                "color": color,
                "full": true,
                "calendar": AES.AES.encrypt(tempCalendar, code).toString(),
                "recurence": generateRepeat(),
                "recurenceEndType": parseInt(recurenceEndType),
                "recurenceEndNbr": generateRecurenceEndNbr(),
            };
            api.post("/create", data).then((res) => {
                props.setisAdd(false);
                props.ajouterEvent();
            });
        } else {
            if (name === "") {
                setNameError(true);
            }
            if (new Date(end) <= new Date(start)) {
                setStartEndError(true);
            }
            //todo treat date error
        }
    }

    function toHtmlDate(dte, fll) {
        var flDay;
        if (fll !== undefined) {
            flDay = fll;
        } else {
            flDay = fullDay;
        }
        var date = new Date(dte);
        let tempM = date.getMonth() + 1;
        if (tempM < 10) {
            tempM = "0" + tempM;
        }
        let tempD = date.getDate();
        if (tempD < 10) {
            tempD = "0" + tempD;
        }
        let tempH = date.getHours();
        if (tempH < 10) {
            tempH = "0" + tempH;
        }
        let tempMn = date.getMinutes();
        if (tempMn < 10) {
            tempMn = "0" + tempMn;
        }
        let temp;
        if (fullDay) {
            temp = date.getFullYear() + "-" + tempM + "-" + tempD;
        } else {
            temp = date.getFullYear() + "-" + tempM + "-" + tempD + "T" + tempH + ":" + tempMn + ":00";
        }
        return temp;
    }

    if (dateChanged === false) {
        var time = new Date(props.time * 1000);
        var now = new Date();
        var mtnH = new Date(time.getFullYear(), time.getMonth(), time.getDate(), now.getHours());
        var mtnD = new Date(time.getFullYear(), time.getMonth(), time.getDate());
        var oneH = new Date(time.getFullYear(), time.getMonth(), time.getDate(), now.getHours() + 1);
        var oneD = new Date(time.getFullYear(), time.getMonth(), time.getDate() + 1);

        if (fullDay && new Date(start).getTime() !== new Date(mtnD).getTime()) {
            if (start !== toHtmlDate(mtnD)) {
                setStart(mtnD);
                setEnd(oneD);
            }
        } else if (fullDay === false && new Date(start).getTime() !== new Date(mtnH).getTime()) {
            setStart(mtnH);
            setEnd(oneH);
        }
    }

    useEffect(() => {
        window.onkeydown = function (e) {
            if (e.keyCode === 13 && canSub) {
                setCanSub(false);
                submitData();
            }
            if (e.keyCode === 27) {
                props.setisAdd(false);
            }
        };
        return () => {
            window.onkeydown = null;
        };
    }, []);

    return (
        <div className="add-container" onClick={() => props.setisAdd(false)}>
            <div className="add-popup" id="add-popup" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: isDisplayPop ? "#0000" : "" }}>
                {!isDisplayPop ? (
                    <>
                        <div className="add-first-line">
                            <h2>New Event</h2>
                        </div>
                        {nameError ? <p className="add-error-line">Please provide a name</p> : null}
                        <div className="add-line">
                            <div className="input-wrapper" style={{ borderColor: colorCodeConv[color] }}>
                                <input
                                    type="text"
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                    style={{ borderColor: colorCodeConv[color] }}
                                    placeholder="Event name"
                                    className="input-open"></input>
                            </div>
                        </div>
                        <div className="add-half-line">
                            <p className="add-p-half">Start Date</p>
                            {window.matchMedia("(max-width: 450px)").matches ? null : <p className="add-p-half">End Date</p>}
                        </div>
                        {dateError ? (
                            <p style={{ bottom: 0 }} className="add-error-line">
                                Incorrect date
                            </p>
                        ) : startEndError ? (
                            <p style={{ bottom: 0 }} className="add-error-line">
                                Event can't end before starting
                            </p>
                        ) : null}
                    </>
                ) : null}
                <div className="add-line">
                    {window.matchMedia("(max-width: 450px)").matches ? (
                        <div className="input-wrapper" style={{ borderColor: colorCodeConv[color] }}>
                            <input
                                value={toHtmlDate(start)}
                                onChange={(e) => {
                                    if (!endChanged) {
                                        setEnd(new Date(new Date(e.target.value).getTime() + 3600000));
                                    }
                                    setDateChanged(true);
                                    setStart(e.target.value);
                                }}
                                style={{ borderColor: colorCodeConv[color] }}
                                type={fullDay ? "date" : "datetime-local"}
                                placeholder="Start date"
                                className="input-open input-add-half input-add-half-first"></input>
                        </div>
                    ) : (
                        <TimeInput
                            ondisplay={(bool) => {
                                setIsDisplayPop(bool);
                            }}
                            full={fullDay}
                            date={start}
                            changement={(d) => {
                                setStart(d);
                                setDateChanged(true);
                            }}
                            isOtherPop={isDisplayPop}
                        />
                    )}
                    {window.matchMedia("(max-width: 450px)").matches ? null : (
                        <TimeInput
                            ondisplay={(bool) => {
                                setIsDisplayPop(bool);
                            }}
                            full={fullDay}
                            date={end}
                            changement={(d) => {
                                setEnd(d);
                                setDateChanged(true);
                            }}
                            isOtherPop={isDisplayPop}
                        />
                    )}
                </div>
                {window.matchMedia("(max-width: 450px)").matches ? (
                    <>
                        <div className="add-half-line">
                            <p className="add-p-half">End Date</p>
                        </div>
                        <div className="add-line">
                            <div className="input-wrapper" style={{ borderColor: colorCodeConv[color] }}>
                                <input
                                    value={toHtmlDate(end)}
                                    onChange={(e) => {
                                        setDateChanged(true);
                                        setEndChanged(true);
                                        setEnd(e.target.value);
                                    }}
                                    style={{
                                        borderColor: colorCodeConv[color],
                                    }}
                                    type={fullDay ? "date" : "datetime-local"}
                                    placeholder="End date"
                                    className="input-open input-add-half input-add-half-second"></input>
                            </div>
                        </div>
                    </>
                ) : null}
                {!isDisplayPop ? (
                    <>
                        <div className="add-under-line">
                            <Checkbox checked={fullDay} changement={(bo) => setFullDay((bo) => !bo)} color={colorCodeConv[color]} txt="All day" />
                        </div>
                        <div className="add-half-line">
                            <p className="add-p-half">Calendar</p>
                            {window.matchMedia("(max-width: 450px)").matches ? null : <p className="add-p-half">Color</p>}
                        </div>
                        <div className="color-add-line add-line">
                            <div className="select-wrapper" style={{ borderColor: colorCodeConv[color] }}>
                                <select style={{ borderColor: colorCodeConv[color] }} value={calendarNbr} onChange={(e) => setCalendarNbr(e.target.value)}>
                                    {props.calendarList().map((x, y) => (
                                        <option key={y} value={y}>
                                            {x}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="select-wrapper" style={{ borderColor: colorCodeConv[color] }}>
                                {window.matchMedia("(max-width: 450px)").matches ? null : (
                                    <select style={{ borderColor: colorCodeConv[color] }} value={color} onChange={(e) => setcolor(e.target.value)}>
                                        {colorConv.map((x, y) => (
                                            <option key={y} style={{ color: colorCodeConv[y] }} value={y}>
                                                {x}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        {window.matchMedia("(max-width: 450px)").matches ? (
                            <>
                                <div className="add-half-line">
                                    <p className="add-p-half">Color</p>
                                </div>
                                <div className="color-add-line add-line">
                                    <div className="select-wrapper" style={{ borderColor: colorCodeConv[color] }}>
                                        <select
                                            style={{
                                                borderColor: colorCodeConv[color],
                                            }}
                                            value={color}
                                            onChange={(e) => setcolor(e.target.value)}>
                                            {colorConv.map((x, y) => (
                                                <option key={y} style={{ color: colorCodeConv[y] }} value={y}>
                                                    {x}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </>
                        ) : null}
                        <div className="add-half-line">
                            <p className="add-p-half">Guests</p>
                        </div>
                        <div className="add-line">
                            <div className="guest-field-wrapper">
                                <div className="guest-field">
                                    {guestList.map((x, y) => (
                                        <div
                                            className="guest-item"
                                            onDoubleClick={() => {
                                                let tmparr = guestList.map((x) => x);
                                                tmparr.splice(y, 1);
                                                setGuestList(tmparr);
                                            }}
                                            style={{ backgroundColor: colorCodeConv[letterNum[x[0]] % 6], color: txtColCode[letterNum[x[0]] % 6] }}>
                                            <p className="guest-name">{x}</p>
                                            <i
                                                className="fas fa-times"
                                                onClick={() => {
                                                    let tmparr = guestList.map((x) => x);
                                                    tmparr.splice(y, 1);
                                                    setGuestList(tmparr);
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <input
                                        className="guest-input"
                                        value={guestSearIn}
                                        placeholder="Add people..."
                                        onChange={(e) => {
                                            setGuestSearIn(e.target.value);
                                            if (e.target.value !== "") {
                                                setGuestSearchList(searchStringInArray(e.target.value, props.user.friend_list.split(","), guestList));
                                            }
                                        }}
                                    />

                                    {/*<div className="guest-add">+</div>*/}
                                </div>
                                {guestSearchList.length > 0 ? (
                                    <div className="guest-search-list">
                                        {guestSearchList.map((searchResults, y) => (
                                            <div
                                                onClick={(e) => {
                                                    if (!guestList.includes(searchResults)) {
                                                        let tmp = guestList;
                                                        tmp.push(searchResults);
                                                        setGuestList(tmp);
                                                        setGuestSearchList([]);
                                                        setGuestSearIn("");
                                                    }
                                                }}
                                                className="guest-search-list-item">
                                                {searchResults}
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div
                            className="add-more"
                            onClick={() => {
                                setIsAdvenced(!isAdvenced);
                                setAdvencedChanged(true);
                            }}>
                            <p>Advanced options</p>
                            {isAdvenced ? (
                                <i className={advencedChanged ? "fas fa-chevron-up add-chevron-annim" : "fas fa-chevron-up"}></i>
                            ) : (
                                <i className={advencedChanged ? "fas fa-chevron-down add-chevron-annim" : "fas fa-chevron-down"}></i>
                            )}
                        </div>
                        {isAdvenced ? (
                            <>
                                <div className="add-half-line">
                                    <p className="add-p-half">Repetition</p>
                                </div>
                                <div className="add-line add-line-repeat" style={{ alignItems: "baseline" }}>
                                    <Checkbox txt="Repeat" checked={isRepeat} changement={(bo) => setIsRepeat((bo) => !bo)} color={colorCodeConv[color]} />
                                    {isRepeat ? (
                                        <>
                                            <p> every </p>
                                            <div className="input-wrapper input-wrapper-number">
                                                <input
                                                    style={{ minWidth: 0 }}
                                                    className="input-open"
                                                    type="number"
                                                    min={1}
                                                    max={9}
                                                    step={1}
                                                    value={recurenceNbr}
                                                    onChange={(e) => setRecurenceNbr(e.target.value)}
                                                />
                                            </div>
                                            <div
                                                className="select-wrapper select-wrapper-not-full"
                                                style={{
                                                    borderColor: colorCodeConv[color],
                                                }}>
                                                <select
                                                    style={{
                                                        borderColor: colorCodeConv[color],
                                                    }}
                                                    value={recurence}
                                                    onChange={(e) => setRecurence(e.target.value)}>
                                                    <option value={1} key={1}>
                                                        Day
                                                    </option>
                                                    <option value={2} key={2}>
                                                        Week
                                                    </option>
                                                    <option value={3} key={3}>
                                                        Month
                                                    </option>
                                                    <option value={4} key={4}>
                                                        Year
                                                    </option>
                                                </select>
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                                {isRepeat ? (
                                    <div className="add-second-line">
                                        <div
                                            className="select-wrapper select-wrapper-not-full"
                                            style={{
                                                borderColor: colorCodeConv[color],
                                            }}>
                                            <select
                                                style={{
                                                    borderColor: colorCodeConv[color],
                                                }}
                                                value={recurenceEndType}
                                                onChange={(e) => setRecurenceEndType(e.target.value)}>
                                                <option key={0} value={0}>
                                                    Forever
                                                </option>
                                                <option key={1} value={1}>
                                                    For a number of occurences
                                                </option>
                                                <option key={2} value={2}>
                                                    Until a certain date
                                                </option>
                                            </select>
                                        </div>
                                        {recurenceEndType == 0 ? null : recurenceEndType == 1 ? (
                                            <div
                                                className="input-wrapper input-wrapper-number"
                                                style={{
                                                    borderColor: colorCodeConv[color],
                                                }}>
                                                <input
                                                    style={{
                                                        minWidth: 0,
                                                        borderColor: colorCodeConv[color],
                                                    }}
                                                    className="input-open"
                                                    type="number"
                                                    min={2}
                                                    step={1}
                                                    value={recurenceEndNbr}
                                                    onChange={(e) => {
                                                        setRecurenceEndNbr(e.target.value);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="input-wrapper"
                                                style={{
                                                    borderColor: colorCodeConv[color],
                                                }}>
                                                <input
                                                    value={recurenceEndNbr}
                                                    onChange={(e) => {
                                                        setRecurenceEndNbr(e.target.value);
                                                    }}
                                                    style={{
                                                        borderColor: colorCodeConv[color],
                                                    }}
                                                    type="date"
                                                    className="input-open input-add-half input-add-half-first"></input>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </>
                        ) : null}
                        <div className="add-button-line add-line">
                            {window.matchMedia("(min-width: 450px)").matches ? (
                                <Button onClick={() => props.setisAdd(false)} txt="Cancel" first />
                            ) : (
                                <Button onClick={() => submitData()} full txt="Create Event" last />
                            )}
                            {window.matchMedia("(min-width: 450px)").matches ? (
                                <Button onClick={() => submitData()} full txt="Create Event" last />
                            ) : (
                                <Button onClick={() => props.setisAdd(false)} txt="Cancel" first />
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};
