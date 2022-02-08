import React, { useState } from "react";
import LogoL from "./logoL.png";
import { api } from "./Main";
import Lock from "./Lock.svg";
/*

<h3>Organise your time, Freely</h3>
<p>Kalendario help you organise your life while staying in controle of your data.</p>
<button className="button-full cta-2" onClick={() => (window.location.href = "/create-account")}>
    Get Started
</button>


<h3>Organise your time, Freely</h3>
<p>
    Kalendario help you organise your life while staying in controle of your data. Using end to end encryption, no one can see what you have planned.
</p>
*/

export const HomePage = () => {
    const [, setHeight] = useState(window.innerHeight);
    const [, setWidth] = useState(window.innerwidth);
    const [logged, setLogged] = useState(false);

    const updateWidthAndHeight = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    };

    React.useEffect(() => {
        window.addEventListener("resize", updateWidthAndHeight);
        return () => window.removeEventListener("resize", updateWidthAndHeight);
    });

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const colorCodeConv = ["#3581B8", "#5BA94C", "#A72A2A"];
    const text = [
        "Meeting",
        "Doctor",
        "Math test",
        "Exam",
        "Final",
        "Guitard lesson",
        "Cinema",
        "Birthday Etan",
        "Birthday Ben",
        "Math HW",
        "Train",
        "Shooting",
        "Party",
        "Vaccination",
        "Gym",
    ];
    // "party" "dinner"
    const heures = ["00", "15", "30", "45"];
    const nbrEvent = Math.floor(Math.random() * 20) + 10;

    var events = {};
    var evenements = [];

    api.get("/").then((res) => {
        if (res.status === 200) {
            setLogged(true);
        }
    });

    function getWeekNum(year, month) {
        var daysNum = 32 - new Date(year, month, 32).getDate(),
            fDayO = new Date(year, month, 1).getDay(),
            fDay = fDayO ? fDayO - 1 : 6,
            weeksNum = Math.ceil((daysNum + fDay) / 7);
        return weeksNum;
    }
    let days = [];
    for (let i = 0; i < getWeekNum(new Date().getFullYear(), new Date().getMonth()); i++) {
        for (let j = 0; j < 7; j++) {
            days.push(i * 7 + j);
        }
    }

    function generateEvents() {
        for (let i = 0; i < nbrEvent; i++) {
            let nbr = Math.floor(Math.random() * days.length);
            if (events[nbr] === undefined) {
                events[nbr] = [];
            }
            if (events[nbr].length < 3) {
                events[nbr].push({
                    name: text[Math.floor(Math.random() * text.length)],
                    color: Math.floor(Math.random() * colorCodeConv.length),
                    hour: "" + (Math.floor(Math.random() * 15) + 8) + "h" + heures[Math.floor(Math.random() * heures.length)],
                    blank: false,
                });
                evenements.push(events[nbr][events[nbr].length - 1]);
                if (Math.floor(Math.random() * 5) === 0) {
                    let mdr = nbr;
                    while (mdr < days.length) {
                        mdr = mdr + 7;
                        if (events[mdr] !== undefined) {
                            events[mdr].push(events[nbr][events[nbr].length - 1]);
                        } else {
                            events[mdr] = [events[nbr][events[nbr].length - 1]];
                        }
                    }
                }
            }
        }
        for (let i = 0; i < days.length; i++) {
            if (events[i] === undefined) {
                events[i] = [];
            }
            while (events[i].length < 3) {
                events[i].push({ blank: true });
            }
        }
    }

    /*//todo function Parralax() {
        return (
            <div className="parallax">
                <div className="home-para-day">
                    <p>{new Date().getDate()}</p>
                    <div className="home-2-event" style={{ backgroundColor: colorCodeConv[0] }}>
                        <label>{evenements[0]["name"]}</label>
                        <label>{evenements[0]["hour"]}</label>
                    </div>
                    <div className="home-2-event" style={{ backgroundColor: colorCodeConv[1] }}>
                        <label>{evenements[1]["name"]}</label>
                        <label>{evenements[1]["hour"]}</label>
                    </div>
                    <div className="home-2-event" style={{ backgroundColor: colorCodeConv[2] }}>
                        <label>{evenements[2]["name"]}</label>
                        <label>{evenements[2]["hour"]}</label>
                    </div>
                </div>
            </div>
        );
    }*/

    //todo on mobile mettre image iphone avec calendar a l'intérieury

    //todo mette vignetage

    var mobile = window.matchMedia("(max-width: 500px)").matches;

    if (!mobile) {
        generateEvents();
    }

    return (
        <div className="home-page-container">
            <div className="home-page-top">
                <img src={LogoL} alt="logo of the website" onClick={() => (window.location.href = "/")} />
                <div className="home-page-top-right">
                    <button className="cta-2-log" onClick={() => (window.location.href = "/login")}>
                        Login
                    </button>
                    {logged ? (
                        <button className="button-full cta-2" onClick={() => (window.location.href = "/calendar")}>
                            Access your calendar
                        </button>
                    ) : (
                        <button className="button-full cta-2" onClick={() => (window.location.href = "/create-account")}>
                            Create an account
                        </button>
                    )}
                </div>
            </div>
            <div className="home-page-content">
                <div className="home-1">
                    <div className="home-1-content">
                        <div className="home-1-title">
                            <h1>Organise your time</h1>
                            <div className="home-list-cont">
                                <h1>Privately</h1>
                                <h1>Freely</h1>
                                <h1>Securely</h1>
                            </div>
                            <h1>using Kalendario</h1>
                        </div>
                        <p>All the features you expect from a calendar with a special focus on privacy.</p>
                        <button className="button-full cta-2" onClick={() => (window.location.href = "/create-account")}>
                            Get Started
                        </button>
                    </div>
                </div>
                {mobile ? null : (
                    <div className="home-2">
                        <div className="home-2-content">
                            <div className="home-2-top">
                                <h2>{months[new Date().getMonth()] + " " + new Date().getFullYear()}</h2>
                                <p className="monthly-prev">&#60;</p>
                                <p className="monthly-next">&#62;</p>
                                <button className="home-add button-full cta-2">+ New</button>
                            </div>
                            <div className="home-2-actual">
                                {days.map((day, i) => (
                                    <div className="home-2-day">
                                        <p>
                                            {new Date(
                                                new Date().getFullYear(),
                                                new Date().getMonth(),
                                                day - new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() + 2
                                            ).getDate()}
                                        </p>
                                        {events[i].map((x) => {
                                            if (x["blank"]) {
                                                return (
                                                    <div className="home-2-event" style={{ opacity: 0 }}>
                                                        <label>no</label>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div className="home-2-event" style={{ backgroundColor: colorCodeConv[x["color"]] }}>
                                                        <label>{x["name"]}</label>
                                                        <label>{x["hour"]}</label>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                ))}
                            </div>
                            <p className="home-2-p" style={{ fontSize: "var(--14px)", maxWidth: "100em", marginTop: "1em", marginBottom: "-1em" }}>
                                *The events displayed are randomly generated and might not make any sense.
                            </p>
                        </div>
                    </div>
                )}
                <div className="home-3 home-1">
                    <div className="home-3-content home-1-content">
                        <div className="home-1-title">
                            <h1>Privacy first</h1>
                        </div>
                        <p>We use sate of the art end-to-end encryption in order to make it impossible for anyone other than you to see what's you've planned.</p>
                        <div className="home-3-img">
                            <img alt="padlock" src={Lock} />
                            <div className="home-3-events">
                                <div className="home-1-event">
                                    <label>Meeting with Sam</label>
                                    <label>10:00</label>
                                </div>
                                <div className="home-1-event">
                                    <label>k@nmxSE3RR3iL$</label>
                                    <label>**:**</label>
                                </div>
                            </div>
                            <div className="home-3-events">
                                <div className="home-1-event">
                                    <label>Cinema with Leo</label>
                                    <label>20:00</label>
                                </div>
                                <div className="home-1-event">
                                    <label>HEord$ZL*7tPby</label>
                                    <label>**:**</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
