import React from "react";
import { useState } from "react";
import { Button } from "./Button";

export const TimeInput = (props) => {
    const [isPop, setIsPop] = useState(false);
    const [fullDay, setFullDay] = useState(props.full ? true : false);
    //const [date, setDate] = useState(props.date !== undefined ? new Date(props.date) : new Date());

    var date = props.date !== undefined ? new Date(props.date) : new Date();
    function setDate(newDate) {
        props.changement(newDate);
    }

    const monthConv = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function getJour(nbr) {
        var offsetbeggin = new Date(date.getFullYear(), date.getMonth(), 0).getDay();
        var day = new Date(date.getFullYear(), date.getMonth(), nbr - offsetbeggin);
        return day;
    }

    var maxNbr = 4;
    if (getJour(29).getMonth() === date.getMonth()) {
        maxNbr = 5;
    }
    if (getJour(36).getMonth() === date.getMonth()) {
        maxNbr = 6;
    }
    var arr = [...Array(maxNbr * 7).keys()].map((x) => x + 1);

    return (
        <>
            {!isPop && !props.isOtherPop ? (
                <div
                    className="time-input"
                    style={{ borderColor: props.color }}
                    onClick={() => {
                        if (props.ondisplay !== undefined) {
                            props.ondisplay(true);
                        }
                        setIsPop(true);
                    }}
                    on>
                    {date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()}
                    {!props.full ? " " + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes() : ""}
                </div>
            ) : null}
            {isPop ? (
                <div
                    className="time-input-cont"
                    onClick={() => {
                        if (props.ondisplay !== undefined) {
                            props.ondisplay(false);
                        }
                        setIsPop(false);
                    }}>
                    <div className="time-input-pop" onClick={(e) => e.stopPropagation()}>
                        <div className="time-input-nbr">
                            <div className="time-in-cont">
                                <button
                                    onClick={() => {
                                        setDate(new Date(new Date(date).setDate(date.getDate() + 1)));
                                    }}>
                                    <i className="fas fa-chevron-up"></i>
                                </button>
                                <input
                                    style={{ width: "2em", minWidth: 0 }}
                                    type="number"
                                    value={date.getDate()}
                                    onChange={(e) => {
                                        setDate(new Date(date.setDate(e.target.value)));
                                    }}
                                    min={1}
                                    max={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
                                />
                                <button
                                    onClick={() => {
                                        setDate(new Date(new Date(date).setDate(date.getDate() - 1)));
                                    }}>
                                    <i className="fas fa-chevron-down"></i>
                                </button>
                            </div>
                            <p>/</p>
                            <div className="time-in-cont">
                                <button
                                    onClick={() => {
                                        setDate(new Date(new Date(date).setMonth(date.getMonth() + 1)));
                                    }}>
                                    <i className="fas fa-chevron-up"></i>
                                </button>
                                <input
                                    style={{ width: "2em", minWidth: 0 }}
                                    type="number"
                                    value={date.getMonth() + 1}
                                    onChange={(e) => {
                                        setDate(new Date(date.setMonth(e.target.value - 1)));
                                    }}
                                    min={1}
                                    max={12}
                                />
                                <button
                                    onClick={() => {
                                        setDate(new Date(new Date(date).setMonth(date.getMonth() - 1)));
                                    }}>
                                    <i className="fas fa-chevron-down"></i>
                                </button>
                            </div>
                            <p>/</p>
                            <div className="time-in-cont">
                                <button
                                    onClick={() => {
                                        setDate(new Date(new Date(date).setFullYear(date.getFullYear() + 1)));
                                    }}>
                                    <i className="fas fa-chevron-up"></i>
                                </button>
                                <input
                                    style={{ width: "4em", marginRight: ".8em", minWidth: 0 }}
                                    type="number"
                                    value={date.getFullYear()}
                                    onChange={(e) => {
                                        setDate(new Date(date.setFullYear(e.target.value)));
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        setDate(new Date(new Date(date).setFullYear(date.getFullYear() - 1)));
                                    }}>
                                    <i className="fas fa-chevron-down"></i>
                                </button>
                            </div>
                            {!props.full ? (
                                <>
                                    <div className="time-in-cont">
                                        <button
                                            onClick={() => {
                                                setDate(new Date(new Date(date).setHours(date.getHours() + 1)));
                                            }}>
                                            <i className="fas fa-chevron-up"></i>
                                        </button>
                                        <input
                                            style={{ width: "2em", minWidth: 0 }}
                                            type="number"
                                            value={date.getHours()}
                                            onChange={(e) => {
                                                setDate(new Date(date.setHours(e.target.value)));
                                            }}
                                            min={0}
                                            max={23}
                                        />
                                        <button
                                            onClick={() => {
                                                setDate(new Date(new Date(date).setHours(date.getHours() - 1)));
                                            }}>
                                            <i className="fas fa-chevron-down"></i>
                                        </button>
                                    </div>
                                    <p>:</p>
                                    <div className="time-in-cont">
                                        <button
                                            onClick={() => {
                                                setDate(new Date(new Date(date).setMinutes(date.getMinutes() + 1)));
                                            }}>
                                            <i className="fas fa-chevron-up"></i>
                                        </button>
                                        <input
                                            style={{ width: "2em", minWidth: 0 }}
                                            type="number"
                                            value={date.getMinutes() > 10 ? date.getMinutes() : "0" + date.getMinutes()}
                                            onChange={(e) => {
                                                setDate(new Date(date.setMinutes(e.target.value)));
                                            }}
                                            min={0}
                                            max={59}
                                        />
                                        <button
                                            onClick={() => {
                                                setDate(new Date(new Date(date).setMinutes(date.getMinutes() - 1)));
                                            }}>
                                            <i className="fas fa-chevron-down"></i>
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                        <div className="time-input-cal">
                            <div className="time-cal-head">
                                <h2 className="time-cal-prev time-cal-nav" onClick={() => setDate(new Date(new Date(date).setMonth(date.getMonth() - 1)))}>
                                    &#60;
                                </h2>
                                <h2>{monthConv[date.getMonth()] + " " + date.getFullYear()}</h2>
                                <h2 className="time-cal-next time-cal-nav" onClick={() => setDate(new Date(new Date(date).setMonth(date.getMonth() + 1)))}>
                                    &#62;
                                </h2>
                            </div>
                            <div className="time-cal-body">
                                {arr.map((x, y) => {
                                    return (
                                        <div className="time-cal-day" key={y}>
                                            <h2
                                                style={{
                                                    backgroundColor:
                                                        getJour(x).getDate() === date.getDate() && getJour(x).getMonth() === date.getMonth() ? "#3581b873" : null,
                                                }}
                                                onClick={(e) => {
                                                    setDate(
                                                        new Date(
                                                            getJour(x).getFullYear(),
                                                            getJour(x).getMonth(),
                                                            getJour(x).getDate(),
                                                            date.getHours(),
                                                            date.getMinutes()
                                                        )
                                                    );
                                                }}>
                                                {getJour(x).getDate()}
                                            </h2>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="time-cal-foot">
                            <Button
                                onClick={() => {
                                    if (props.ondisplay !== undefined) {
                                        props.ondisplay(false);
                                    }
                                    setIsPop(false);
                                }}
                                txt="Ok"
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};
