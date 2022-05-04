import React from "react";
import LogoL from "./logoL.png";
import { useState } from "react";
import { parseString } from "./Icalparse";
import { api, decryptCode } from "./Main";
import { useCookies } from "react-cookie";
import AES from "crypto-js";
import { sha256 } from "js-sha256";
import { BrowserView, MobileView } from "react-device-detect";
import { Button } from "./Button";
import validator from "validator";

export const Header = (props) => {
    const colorCodeConv = ["#3581B8", "#5BA94C", "#E4C111", "#FF6B35", "#A72A2A"];

    const [cookies] = useCookies();

    var varCode = "";

    /*if (cookies.code !== undefined) {
        varCode = cookies.code;
    } else*/ if (sessionStorage.getItem("code") !== null) {
        varCode = sessionStorage.getItem("code");
    } else {
        varCode = "";
    }

    const [isDrop, setisDrop] = useState(false);
    const [selected, setSelected] = useState(0);
    const [file, setFile] = useState(null);
    const [calendarNbr, setCalendarNbr] = useState(0);
    const labels = ["Account", "Settings", "Import/Export"];
    const [importEvt, setImportEvt] = useState([]);
    const [fileStr, setFileStr] = useState("");
    const [importing, setImporting] = useState(false);
    const [step, setstep] = useState(0);
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [passMatch, setPassMatch] = useState(false);
    const [passRight, setPassRight] = useState(false);
    const [isPassChPop, setIsPassChPop] = useState(false);

    const [isSocialDrop, setIsSocialDrop] = useState(false);
    const [searchResults, setSearchResults] = useState(null);

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

    function changePassword() {
        if (newPass === confirmPass) {
            setPassMatch(false);
            var mdp = props.user["email"] + "sel" + oldPass;
            mdp = sha256(mdp);
            api.get("/login?mdp=" + mdp)
                .then((res) => {
                    if (res.status === 200) {
                        setPassRight(false);
                        var mdp = props.user["email"] + "sel" + newPass;
                        mdp = sha256(mdp);
                        api.get("/change-password?mdp=" + mdp).then((res) => {
                            if (res.status === 200) {
                                setisDrop(false);
                                setIsPassChPop(false);
                            }
                        });
                    }
                })
                .catch((err) => {
                    if (err.response.status === 401) {
                        setPassRight(true);
                    }
                });
        } else {
            setPassMatch(true);
        }
    }

    function generateRecurenceEndNbr(recurenceEndType, recurenceEndNbr, start, recurence, recurenceNbr) {
        if (recurenceEndType === 2) {
            return new Date(recurenceEndNbr).getTime();
        } else if (recurenceEndType === 1) {
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
                default:
                    dateEnd.setDate(dateEnd.getDate() + recurenceNbr * (recurenceEndNbr - 1));
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
                //eslint-disable-next-line
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

    function FriendItem(props) {
        return (
            <div className="friend-item">
                <div className="friend-pp" style={{ backgroundColor: colorCodeConv[letterNum[props.friend.name[0]] % 6] }}>
                    {props.friend.name[0] + props.friend.name[1]}
                </div>
                <div className="friend-txt">
                    <div className="friend-name">{props.friend.name}</div>
                    <div className="friend-email">{props.friend.email}</div>
                </div>
                <div className="friend-icon">
                    {props.request ? <i class="fa-solid fa-check friend-cross" /> : null}
                    <i className="fas fa-times friend-cross" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <header>
                <img src={LogoL} alt="logo-large" onClick={() => (window.location.href = "/")} />
                <div className="header-right">
                    <div className="social">
                        <div className="social-icon" onClick={() => setIsSocialDrop(true)}>
                            <i className="fa-solid fa-user-group" />
                        </div>
                        {isSocialDrop ? (
                            <div className="social-drop-cont" onClick={() => setIsSocialDrop(false)}>
                                <div className="social-drop" onClick={(e) => e.stopPropagation()}>
                                    <i
                                        className="fas fa-times cross"
                                        onClick={(e) => {
                                            setIsSocialDrop(false);
                                        }}
                                    />
                                    <div className="search-cont">
                                        <input
                                            type="search"
                                            className="input-contained"
                                            onChange={(e) => {
                                                if (validator.isEmail(e.target.value)) {
                                                    api.get("getUserByEmail?email=" + e.target.value)
                                                        .then((res) => {
                                                            if (res.status === 200) {
                                                                setSearchResults({ "name": res.data.username, "email": res.data.email });
                                                            }
                                                        })
                                                        .catch((err) => {
                                                            setSearchResults(null);
                                                        });
                                                }
                                            }}
                                        />
                                        <i className="fa-solid fa-magnifying-glass" />
                                        {searchResults !== null ? (
                                            <div className="search-res">
                                                <div className="search-res-item" onClick={() => {}}>
                                                    <div className="friend-pp" style={{ backgroundColor: colorCodeConv[letterNum[searchResults.name[0]] % 6] }}>
                                                        {searchResults.name[0] + searchResults.name[1]}
                                                    </div>
                                                    <div className="search-res-text">
                                                        <div className="search-res-name">{searchResults.name}</div>
                                                        <div className="search-res-email">{searchResults.email}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="social-drop-content">
                                        <div className="social-left">
                                            <h2>Your friends</h2>
                                            {/*<FriendItem friend={{ name: "John Doe", email: "john.doe@kalendario.app" }} />*/}
                                        </div>
                                        <div className="social-right">
                                            <h2>Friends Request</h2>
                                            {/*//todo afficher un msg si y'a pas d'amis */}
                                            {/* <FriendItem request friend={{ name: "Sohn Doe", email: "john.doe@kalendario.app" }} /> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
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
                                        </label>
                                    </section>
                                    <section>
                                        {selected === 0 ? (
                                            <>
                                                {isPassChPop ? (
                                                    <div className="calendar-delete-container" onClick={() => setIsPassChPop(false)}>
                                                        <div className="calendar-delete-popup" onClick={(e) => e.stopPropagation()}>
                                                            <h2>Are you sure that you want to change your password</h2>
                                                            <div className="calendar-delete-btn">
                                                                <Button full txt="No take me back" first onClick={() => setIsPassChPop(false)} />
                                                                <Button full txt="Yes Change it" last onClick={() => changePassword()} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <h2>Account</h2>
                                                <h3>Name</h3>
                                                <p>{props.user.username}</p>
                                                <h3>Email</h3>
                                                <p>{props.user.email}</p>
                                                <h3>Change your password</h3>
                                                <p style={{ marginBottom: "0.2em" }}>Your old password</p>
                                                {passRight ? <p style={{ color: "var(--error-color)", fontWeight: 500, marginBottom: 0 }}>Wrong password</p> : null}
                                                <input
                                                    className="input-contained"
                                                    type="password"
                                                    placeholder="Old password"
                                                    onChange={(e) => setOldPass(e.target.value)}
                                                />
                                                <p style={{ marginBottom: "0.2em" }}>Your new password</p>
                                                <input
                                                    className="input-contained"
                                                    type="password"
                                                    placeholder="New password"
                                                    onChange={(e) => setNewPass(e.target.value)}
                                                />
                                                <p style={{ marginBottom: "0.2em" }}>Your new password again</p>
                                                {passMatch ? (
                                                    <p style={{ color: "var(--error-color)", fontWeight: 500, marginBottom: 0 }}>Both passwords don't match</p>
                                                ) : null}
                                                <input
                                                    className="input-contained"
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    onChange={(e) => setConfirmPass(e.target.value)}
                                                />
                                                <div className="imp-buttons">
                                                    <button
                                                        style={{ fontSize: "16px" }}
                                                        id="import-button"
                                                        className="imp-button button-full cta-2"
                                                        onClick={() => setIsPassChPop(true)}>
                                                        Change password
                                                    </button>
                                                </div>
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
                                            <>
                                                <BrowserView>
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
                                                                            className={
                                                                                importEvt.length === 0 ? "disabled-input file-input" : "imp-button button-full cta-2"
                                                                            }
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
                                                </BrowserView>
                                                <MobileView>
                                                    <h2>Import/export</h2>
                                                    <p>
                                                        Importing and exporting are not supported on mobile yet, please visite this page from a computer to import your
                                                        calendar.
                                                    </p>
                                                </MobileView>
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                    </section>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </header>
        </div>
    );
};
