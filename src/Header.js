import React from "react";
import LogoL from "./logoL.png";
import { useState } from "react";
import { parseString } from "./Icalparse";
import { api, decryptCode } from "./Main";
import { useCookies } from "react-cookie";
import AES from "crypto-js";
import { sha256 } from "js-sha256";

export const Header = (props) => {
    const [cookies] = useCookies();

    var varCode = "";

    if (cookies.code !== undefined) {
        varCode = cookies.code;
    } else if (sessionStorage.getItem("code") !== null) {
        varCode = sessionStorage.getItem("code");
    } else {
        varCode = "";
    }

    const [isDrop, setisDrop] = useState(false);
    const [selected, setSelected] = useState(0);
    const [userName, setUserName] = useState(props.user.username);
    const [file, setFile] = useState(null);
    const [calendarNbr, setCalendarNbr] = useState(0);
    const labels = ["Account", "Settings", "Import/Export"];
    const [importEvt, setImportEvt] = useState([]);
    const [fileStr, setFileStr] = useState("");
    const [importing, setImporting] = useState(false);
    const [step, setstep] = useState(0);

    var code = decryptCode(varCode, props.user) + " ceci est du sel";

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
    function keyGen() {
        let tmp = stringFilter(sha256(code)) + stringFilter(sha256(code + "test")) + code.length;
        if (toString(tmp).length > 8) {
            tmp = tmp.slice(0, 7);
        }
        return parseInt(tmp);
    }

    function generateRecurenceEndNbr(recurenceEndType, recurenceEndNbr, start, recurence, recurenceNbr) {
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

    function handleImport(str) {
        let evts = parseString(str)["events"];
        let importedEvt = [];
        var TZoffset = new Date().getTimezoneOffset() * 60;
        var dteKey = keyGen(code) + TZoffset;
        for (let i = 0; i < evts.length; i++) {
            importedEvt[i] = {};
            let evt = importedEvt[i];
            evt["event_name"] = evts[i]["summary"]["value"];
            if (evts[i]["summary"] === "") {
                evt["event_name"] = "Untitled Event";
            }
            evt["event_name"] = AES.AES.encrypt(evt["event_name"], code).toString();
            evt["start_date"] = Math.floor(new Date(evts[i]["dtstart"]["value"]).getTime() / 1000) + dteKey;
            evt["end_date"] = Math.floor(new Date(evts[i]["dtend"]["value"]).getTime() / 1000) + dteKey;
            evt["color"] = 0;
            evt["full"] = true;
            evt["calendar"] = AES.AES.encrypt(props.calendarList()[calendarNbr], code).toString();
            if (evts[i]["recurrenceRule"] === undefined) {
                evt["recurence"] = -1;
                evt["recurenceEndNbr"] = -1;
                evt["recurenceEndType"] = 0;
            } else {
                let rec = evts[i]["recurrenceRule"]["options"];
                let recu = "";
                if (rec["bymonth"] !== null) {
                    recu = recu + "4";
                } else if (rec["byweekday"] !== null) {
                    recu = recu + "2";
                } else {
                    recu = recu + "1";
                }
                if (rec["count"] !== null) {
                    evt["recurenceEndNbr"] = generateRecurenceEndNbr(1, rec["count"], evt["start_date"], recu, rec["interval"]);
                    evt["recurenceEndType"] = 1;
                } else if (rec["until"] !== null) {
                    evt["recurenceEndNbr"] = generateRecurenceEndNbr(2, rec["until"], evt["start_date"], recu, rec["interval"]);
                    evt["recurenceEndType"] = 2;
                } else {
                    evt["recurenceEndNbr"] = -1;
                    evt["recurenceEndType"] = 0;
                }
                recu = recu + rec["interval"];
                evt["recurence"] = parseInt(recu);
            }
        }
        setImportEvt(importedEvt);
        setFileStr(str);
        return importedEvt;
    }
    function submitImport() {
        if (importEvt.length <= 0 || importing) {
            alert("nop");
            return;
        }
        let data = handleImport(fileStr);
        setImporting(true);
        let nbr = 0;
        for (let i = 0; i < data.length; i++) {
            let event = data[i];
            api.post("/create", event)
                .then((res) => {
                    if (res.status === 201) {
                        nbr++;
                    }
                    if (nbr === data.length) {
                        document.getElementById("import-button").classList = "imp-button button-full cta-2";
                        setImporting(false);
                        props.forceReload();
                    }
                })
                .catch((err) => {});
        }
    }

    return (
        <div>
            <header>
                <img src={LogoL} alt="logo-large" onClick={() => (window.location.href = "/")} />

                {props.user.username !== undefined ? (
                    <div className="profil-pic" onClick={() => setisDrop(!isDrop)}>
                        <p>
                            {props.user.username[0]}
                            {props.user.username[1]}
                        </p>
                    </div>
                ) : (
                    <div className="profil-pic-not-logged"></div>
                )}
                {isDrop ? (
                    <>
                        <div className="profil-drop-detector" onClick={() => setisDrop(false)}>
                            <div className="profil-pic-drop" onClick={(e) => e.stopPropagation()}>
                                <i
                                    className="fas fa-times cross"
                                    onClick={(e) => {
                                        setisDrop(false);
                                    }}
                                />
                                <section>
                                    {labels.map((x, y) => (
                                        <label className={selected === y ? "selected" : ""} key={y} onClick={(e) => setSelected(y)}>
                                            {x}
                                            <strong>Test test</strong>
                                        </label>
                                    ))}
                                    <label
                                        className="logout"
                                        onClick={() => {
                                            setisDrop(false);
                                            api.get("/logout").then((res) => {
                                                if (res.status === 200) {
                                                    window.location.href = "/";
                                                }
                                            });
                                        }}>
                                        <i className="fas fa-sign-out-alt" />
                                        Logout
                                        <strong>Test test</strong>
                                    </label>
                                </section>
                                <section>
                                    {selected === 0 ? (
                                        <>
                                            <h2>Account</h2>
                                            <h3>Name</h3>
                                            <p>{props.user.username}</p>
                                            <h3>Email</h3>
                                            <p>{props.user.email}</p>
                                            {/*<div className="profil-pic">
                                                <p>
                                                    {props.user.username[0]}
                                                    {props.user.username[1]}
                                                </p>
                                    </div>*/}
                                        </>
                                    ) : selected === 1 ? (
                                        <>
                                            <h2>Settings</h2>
                                        </>
                                    ) : selected === 2 ? (
                                        <div className="import-section">
                                            <div>
                                                <h2>Import</h2>
                                                <p className="imp-cal-p">First select your .ics file</p>
                                                {/*//todo help to export*/}
                                                <div className="file-input">
                                                    <input
                                                        className="input-contained"
                                                        type="file"
                                                        accept=".ics"
                                                        onChange={(e) => {
                                                            e.target.files[0].text().then((f) => handleImport(f));
                                                            setstep(1);
                                                            setFile(e.target.files[0].name);
                                                        }}
                                                        multiple={false}
                                                    />
                                                    {file !== null ? file : "Select a file from your computer"}
                                                </div>
                                                {step > 0 ? (
                                                    <>
                                                        {" "}
                                                        <p className="imp-cal-p">Then select the calendar in wich you want your event to be imported </p>
                                                        <div className="import-select select-wrapper" style={{ borderColor: "#3581b8" }}>
                                                            <select
                                                                style={{ borderColor: "#3581b8" }}
                                                                value={calendarNbr}
                                                                onChange={(e) => setCalendarNbr(e.target.value)}>
                                                                {props.calendarList().map((x, y) => (
                                                                    <option key={y} value={y}>
                                                                        {x}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </>
                                                ) : null}
                                                {step > 0 ? (
                                                    <>
                                                        <p className="imp-cal-p">Then just click import</p>
                                                        <div className="imp-buttons">
                                                            <button
                                                                id="import-button"
                                                                className={importEvt.length === 0 ? "disabled-input file-input" : "imp-button button-full cta-2"}
                                                                onClick={() => {
                                                                    if (importEvt.length !== 0) {
                                                                        submitImport();
                                                                        document.getElementById("import-button").classList = "disabled-input file-input";
                                                                    } else {
                                                                        return;
                                                                    }
                                                                }}>
                                                                Import
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : null}
                                                {/*<h2>Export</h2>*/}
                                            </div>
                                        </div>
                                    ) : (
                                        <></>
                                    )}
                                </section>
                            </div>
                        </div>
                    </>
                ) : null}
            </header>
        </div>
    );
};

/*<div
                                    className="profil-pic-element"
                                    style={{ color: "var(--error-color)" }}
                                    onClick={() => {
                                        setisDrop(false);
                                        api.get("/logout").then((res) => {
                                            if (res.status === 200) {
                                                window.location.href = "/";
                                            }
                                        });
                                    }}>
                                     Logout
                                </div>*/
