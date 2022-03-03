import React from "react";
import { useState } from "react";
import { Button } from "./Button";

export const TimeInput = (props) => {
    const [isPop, setIsPop] = useState(false);
    const [fullDay, setFullDay] = useState(props.full ? true : false);
    const [date, setDate] = useState(props.date !== undefined ? new Date(props.date) : new Date());

    return (
        <>
            <div className="time-input" style={{ borderColor: props.color }} onClick={() => setIsPop(true)}>
                {date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()}
                {!fullDay ? " " + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes() : ""}
            </div>
            {isPop ? (
                <div className="add-container time-input-cont" onClick={() => setIsPop(false)}>
                    <div className="add-popup time-input-pop" onClick={(e) => e.stopPropagation()}>
                        <div className="time-in-cont">
                            <button
                                onClick={() => {
                                    setDate(new Date(new Date(date).setDate(date.getDate() + 1)));
                                }}>
                                <i class="fas fa-chevron-up"></i>
                            </button>
                            <input
                                style={{ width: "2em" }}
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
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                        <p>/</p>
                        <div className="time-in-cont">
                            <button
                                onClick={() => {
                                    setDate(new Date(new Date(date).setMonth(date.getMonth() + 1)));
                                }}>
                                <i class="fas fa-chevron-up"></i>
                            </button>
                            <input
                                style={{ width: "2em" }}
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
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                        <p>/</p>
                        <div className="time-in-cont">
                            <button
                                onClick={() => {
                                    setDate(new Date(new Date(date).setFullYear(date.getFullYear() + 1)));
                                }}>
                                <i class="fas fa-chevron-up"></i>
                            </button>
                            <input
                                style={{ width: "4em", marginRight: ".8em" }}
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
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                        <div className="time-in-cont">
                            <button
                                onClick={() => {
                                    setDate(new Date(new Date(date).setHours(date.getHours() + 1)));
                                }}>
                                <i class="fas fa-chevron-up"></i>
                            </button>
                            <input
                                style={{ width: "2em" }}
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
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                        <p>:</p>
                        <div className="time-in-cont">
                            <button
                                onClick={() => {
                                    setDate(new Date(new Date(date).setMinutes(date.getMinutes() + 1)));
                                }}>
                                <i class="fas fa-chevron-up"></i>
                            </button>
                            <input
                                style={{ width: "2em" }}
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
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};
