import { AES, enc } from "crypto-js";
import { sha256 } from "js-sha256";
import React, { useState } from "react";
import { Button } from "./Button";
import { api, decryptCode } from "./Main";
import { TimeInput } from "./TimeInput";

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

export function Todo(props) {
    const [list, setList] = useState(props.todoList);
    const [isAdd, setIsAdd] = useState(false);
    const [txt, setTxt] = useState("");
    const [date, setDate] = useState(new Date(new Date().setHours(new Date().getHours() + 1, 0, 0, 0)).getTime());
    const [isMore, setIsMore] = useState(false);
    const [color, setColor] = useState(0);
    const [full, setFull] = useState(false);

    const colorConv = ["Blue", "Green", "Yellow", "Orange", "Red"];
    const colorCodeConv = ["#3581B8", "#5BA94C", "#E4C111", "#FF6B35", "#A72A2A"];

    let varCode = "";
    if (sessionStorage.getItem("code") !== null) {
        varCode = sessionStorage.getItem("code");
    } else {
        varCode = "";
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
    function addTodo() {
        let code = decryptCode(varCode, props.user);
        let TZOffset = new Date().getTimezoneOffset() * 60;
        code = code.concat(" ceci est du sel");
        if (txt === "") {
            return;
        }
        let data = {
            "name": AES.encrypt(txt, code).toString(),
            "date": Math.floor(date / 1000) + TZOffset + (date > 10000 ? keyGen(code) : 0),
            "color": color,
            "calendar": AES.encrypt(props.calendarList[0], code).toString(),
            "repeat_type": 0,
            "repeat_nbr": 0,
            "repeat_end_type": 0,
            "repeat_end_nbr": 0,
        };
        api.post("/createTodo", data)
            .then((res) => {
                data["key"] = res.data.key;
                data["name"] = AES.decrypt(data["name"], code).toString(enc.Utf8);
                data["calendar"] = AES.decrypt(data["calendar"], code).toString(enc.Utf8);
                data["date"] = data["date"] - keyGen(code);
                data["done"] = false;
                setList([...list, data]);
                //setIsAdd(false);
                setTxt("");
            })
            .catch((err) => {
                console.log(err);
            });
    }

    window.onkeydown = function (e) {
        if (!isAdd) {
            return;
        }
        if (e.keyCode === 13) {
            addTodo();
        }
        if (e.keyCode === 27) {
            setIsAdd(false);
        }
    };

    function TodoItem(props) {
        const [checked, setChecked] = useState(false);
        function postClick() {}
        function handleClick() {
            setChecked(true);
            document.getElementById(props.id).className += " todo-item-checked";
            document.getElementById("check-" + props.id).style.backgroundColor = colorCodeConv[props.color];
            api.get("/checkTodo?key=" + props.item["key"]).then((res) => {
                if (res.status === 200) {
                    let tmpArr = tmp;
                    tmpArr[props.index]["done"] = true;
                    setList(tmpArr);
                }
            });
        }

        let date = new Date(props.date * 1000);
        let dateStr = "";
        let now = new Date();
        if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            dateStr = dateStr.concat("Today");
        } else if (date.getDate() === now.getDate() + 1 && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            dateStr = dateStr.concat("Tomorrow");
        } else if (date.getDate() === now.getDate() - 1 && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            dateStr = dateStr.concat("Yesterday");
        } else {
            dateStr = dateStr.concat(monthConv[date.getMonth() + 1]);
            dateStr = dateStr.concat(", ");
            dateStr = dateStr.concat(date.getDate());
            dateStr = dateStr.concat(" ");
            dateStr = dateStr.concat(date.getFullYear());
        }
        if (date.getHours() !== 0 && date.getMinutes() !== 0) {
            dateStr = dateStr.concat(" at ");
            if (date.getHours() < 10) {
                dateStr = dateStr.concat("0");
            }
            dateStr = dateStr.concat(date.getHours());
            dateStr = dateStr.concat("h");
            dateStr = dateStr.concat(date.getMinutes());
            if (date.getMinutes() < 10) {
                dateStr = dateStr.concat("0");
            }
        }

        return (
            <div
                onClick={() => {
                    handleClick();
                }}
                id={props.id}
                className="check-container todo-item">
                <input type="checkbox" checked={checked} onChange={() => null}></input>
                <span className="checkmark" id={"check-" + props.id} style={{ borderColor: colorCodeConv[props.color] }}></span>
                <div className="todo-txt">
                    <h3>{props.txt}</h3>
                    {props.date > 100000 ? <p>{dateStr}</p> : null}
                </div>
            </div>
        );
    }

    let tmp = list.filter((item) => {
        return item["done"] === false;
    });
    tmp.sort((a, b) => {
        return a["date"] - b["date"];
    });

    return (
        <div className="todo-container" style={{ height: props.height }}>
            <div className="calendar-select-top">
                <h2>Todo list</h2>
                <h2 onClick={() => setIsAdd(!isAdd)} id="calendar-add">
                    +
                </h2>
            </div>

            <div className="todo-list">
                {isAdd ? (
                    <div className="cal-edit">
                        <div className="input-wrapper" style={{ borderColor: colorCodeConv[color] }}>
                            <input
                                value={txt}
                                style={{ borderColor: colorCodeConv[color] }}
                                autoFocus
                                onChange={(e) => setTxt(e.target.value)}
                                className="input-open cal-edit-input"
                                placeholder={"Task name"}
                            />
                        </div>
                        {isMore ? (
                            <div>
                                <TimeInput full={full} date={date} color={colorCodeConv[color]} changement={(d) => setDate(d)} />
                                <select style={{ borderColor: colorCodeConv[color] }} value={color} onChange={(e) => setColor(e.target.value)}>
                                    {colorConv.map((x, y) => (
                                        <option key={y} style={{ color: colorCodeConv[y] }} value={y}>
                                            {x}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : null}
                        <div className="cal-edit-btns">
                            <Button txt="Option" onClick={() => setIsMore(!isMore)} />
                            <Button txt="Cancel" onClick={() => setIsAdd(false)} />
                            <Button
                                onClick={() => {
                                    addTodo();
                                    setIsAdd(false);
                                }}
                                full
                                txt={"Add"}
                            />
                        </div>
                    </div>
                ) : null}
                {tmp.map((item, index) => (
                    <TodoItem txt={item.name} color={item.color} index={index} key={index} checked={item.done} date={item.date} item={item} id={"todo-" + index} />
                ))}
                {tmp.length < 1 && !isAdd ? (
                    <div className="next-event-error">
                        <p>Il n'y a rien par ici...</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
