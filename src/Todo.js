import { AES, enc } from "crypto-js";
import { sha256 } from "js-sha256";
import React, { useState } from "react";
import { Button } from "./Button";
import { api, decryptCode } from "./Main";

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
            "date": 0,
            "color": 0,
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
                setIsAdd(false);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    window.onkeydown = function (e) {
        if (e.keyCode === 13) {
            addTodo();
        }
    };

    function TodoItem(props) {
        const [checked, setChecked] = useState(false);
        function postClick() {}
        function handleClick() {
            setChecked(true);
            document.getElementById(props.id).className += " todo-item-checked";
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
                <span className="checkmark" style={{ borderColor: props.color, backgroundColor: checked ? props.color : "#EEF2F6" }}></span>
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
            {isAdd ? (
                <div className="cal-edit">
                    <input autoFocus onChange={(e) => setTxt(e.target.value)} className="input-open cal-edit-input" placeholder={"Task name"} />
                    <div className="cal-edit-btns">
                        {/*//todo ajouter un selecteur de date qui ouvre un popup pour la date */}
                        <Button txt="Cancel" onClick={() => setIsAdd(false)} />
                        <Button onClick={() => addTodo()} full txt={"Add"} />
                    </div>
                </div>
            ) : null}

            <div className="todo-list">
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