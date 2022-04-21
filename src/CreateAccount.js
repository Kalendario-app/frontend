import React, { useState } from "react";
import { Button } from "./Button";
import { sha256 } from "js-sha256";
import axios from "axios";
import { api } from "./Main";
import { Checkbox } from "./Checkbox";
import validator from "validator";
import { JSEncrypt } from "jsencrypt";
import { AES } from "crypto-js";

axios.defaults.withCredentials = true;

export const CreateAccount = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConf, setpasswordConf] = useState("");
    const [code, setCode] = useState("");
    const [codeConf, setCodeConf] = useState("");
    const [Wmail, setWmail] = useState(true);
    const [mailTaken, setMailTaken] = useState(false);
    const [userTaken, setUserTaken] = useState(false);
    const [errors, setErrors] = useState({
        passNotSIm: false,
        codeNotSim: false,
        invalidMail: false,
        noPass: false,
        noCode: false,
        noUser: false,
    });
    const [created, setCreated] = useState(true);

    const [relaod, setRelaod] = useState(0);
    const [resended, setResended] = useState(false);

    function submitData() {
        if (password === passwordConf && code === codeConf && validator.isEmail(email) && password !== "" && code !== "" && username !== "") {
            api.get("/checkUnique?user=" + username + "&email=" + email)
                .then((res) => {
                    if (res.status === 400) {
                        window.location.href = "./calendar";
                    }
                    if (res.data["email"] !== true && res.data["user"] !== true) {
                        var mdp = email + "sel" + password;
                        mdp = sha256(mdp);
                        var encrypt = new JSEncrypt();
                        var pub_key = encrypt.getPublicKey();
                        var priv_key_enc = AES.encrypt(encrypt.getPrivateKey(), code).toString();
                        var data = {
                            "email": email,
                            "password": mdp,
                            "username": username,
                            "key": sha256(code),
                            "want_mail": Wmail,
                            "pub_key": pub_key,
                            "priv_key": priv_key_enc,
                        };
                        api.post("/userCreate", data)
                            .then((res) => {
                                if (res.status === 201) {
                                    setCreated(true);
                                }
                            })
                            .catch((err) => console.log(err));
                    } else {
                        if (res.data["username"]) {
                            setUserTaken(res.data["username"]);
                        }
                        if (res.data["email"]) {
                            setMailTaken(res.data["email"]);
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            let tmp = errors;
            if (password !== passwordConf) {
                tmp["passNotSIm"] = true;
            } else {
                tmp["passNotSIm"] = false;
            }
            if (code !== codeConf) {
                tmp["codeNotSim"] = true;
            } else {
                tmp["codeNotSim"] = false;
            }
            if (validator.isEmail(email) === false) {
                tmp["invalidMail"] = true;
            } else {
                tmp["invalidMail"] = false;
            }
            if (password === "") {
                tmp["noPass"] = true;
            } else {
                tmp["noPass"] = false;
            }
            if (code === "") {
                tmp["noCode"] = true;
            } else {
                tmp["noCode"] = false;
            }
            if (username === "") {
                tmp["noUser"] = true;
            } else {
                tmp["noUser"] = false;
            }
            setErrors(tmp);
            setRelaod(relaod + 1);
        }
    }

    var passStrenght = 0;
    var Smin = false;
    var Smaj = false;
    var Snum = false;
    var SChar = false;
    for (var i = 0; i < password.length; i++) {
        if (password[i] === password[i].toLowerCase() && password[i] !== password[i].toUpperCase()) {
            Smin = true;
        }
        if (password[i] === password[i].toUpperCase() && password[i] !== password[i].toLowerCase()) {
            Smaj = true;
        }
        if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(password[i])) {
            Snum = true;
        }
        if (["#", "@", "&", "~", "'", "(", ")", "!", '"', ":", ";", "?", ",", ".", "-"].includes(password[i])) {
            SChar = true;
        }
    }
    if (Smin) {
        passStrenght++;
    }
    if (Smaj) {
        passStrenght++;
    }
    if (Snum) {
        passStrenght++;
    }
    if (SChar) {
        passStrenght++;
    }
    if (password.length >= 8) {
        passStrenght++;
    }

    return (
        <div className="create-account login-container">
            <div className="create-card login-card">
                {!created ? (
                    <>
                        <h1>Create an account</h1>
                        <p className="p-non-error">Your username</p>
                        <input
                            type="text"
                            onChange={(e) => {
                                setUsername(e.target.value);
                            }}
                            autoComplete="off"
                            autoCapitalize="off"
                            className="create-email input-contained"
                            autoFocus="autofocus"
                            placeholder="Your username"
                            required="required"
                            value={username}
                        />
                        {userTaken ? <p>Username already taken</p> : null}
                        {errors["noUser"] ? <p>Please enter a username</p> : null}
                        <p className="p-non-error">Your email</p>
                        <input
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="create-email input-contained"
                            autoComplete="off"
                            autoCapitalize="off"
                            placeholder="Your email"
                            required="required"
                            value={email}
                        />
                        {mailTaken ? <p>Email already in use</p> : null}
                        {errors["invalidMail"] ? <p>Please enter a valid email</p> : null}
                        <p className="p-non-error create-margin-top">Your password</p>
                        <input
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="create-password input-contained"
                            autoComplete="off"
                            autoCapitalize="off"
                            placeholder="Choose a password"
                            required="required"
                            value={password}
                        />
                        {errors["noPass"] ? <p>Please enter a password</p> : null}
                        <p className="p-non-error">Confirm your password</p>
                        <input
                            type="password"
                            onChange={(e) => setpasswordConf(e.target.value)}
                            className="create-password input-contained"
                            id="create-pass-conf"
                            autoComplete="off"
                            autoCapitalize="off"
                            placeholder="Confirm your password"
                            required="required"
                            value={passwordConf}
                        />
                        <div className="pass-strength-cont">
                            <div style={{ backgroundColor: passStrenght < 1 ? "#949aa0" : passStrenght < 3 ? "#752424" : passStrenght < 5 ? "#E4C111" : "#5BA94C" }} />
                            <div style={{ backgroundColor: passStrenght < 2 ? "#949aa0" : passStrenght < 3 ? "#752424" : passStrenght < 5 ? "#E4C111" : "#5BA94C" }} />
                            <div style={{ backgroundColor: passStrenght < 3 ? "#949aa0" : passStrenght < 3 ? "#752424" : passStrenght < 5 ? "#E4C111" : "#5BA94C" }} />
                            <div style={{ backgroundColor: passStrenght < 4 ? "#949aa0" : passStrenght < 3 ? "#752424" : passStrenght < 5 ? "#E4C111" : "#5BA94C" }} />
                            <div style={{ backgroundColor: passStrenght < 5 ? "#949aa0" : passStrenght < 3 ? "#752424" : passStrenght < 5 ? "#E4C111" : "#5BA94C" }} />
                        </div>
                        <div className="pass-strenght-tips">
                            <p style={{ color: Smaj ? "#5BA94C" : "#1b2228" }}>Password must contain an uppercase</p>
                        </div>
                        <div className="pass-strenght-tips">
                            <p style={{ color: Smin ? "#5BA94C" : "#1b2228" }}>Password must contain a lowercase</p>
                        </div>
                        <div className="pass-strenght-tips">
                            <p style={{ color: Snum ? "#5BA94C" : "#1b2228" }}>Password must contain a number</p>
                        </div>
                        <div className="pass-strenght-tips">
                            <p style={{ color: SChar ? "#5BA94C" : "#1b2228" }}>Password must contain a special symbol</p>
                        </div>
                        <div className="pass-strenght-tips">
                            <p style={{ color: password.length >= 8 ? "#5BA94C" : "#1b2228" }}>Password must contain at least 8 charactere</p>
                        </div>
                        {errors["passNotSIm"] ? <p>Passwords are not the same</p> : null}
                        <p className="p-non-error create-margin-top">Enter a secret code</p>
                        <input
                            type="password"
                            onChange={(e) => setCode(e.target.value)}
                            className="create-code input-contained"
                            autoComplete="off"
                            autoCapitalize="off"
                            placeholder="Enter your secret code"
                            required="required"
                            value={code}
                        />
                        <p className="warning-code-sign">
                            Your code is used to encrypt your events, as oppose to the password, if you loose your code, we won't be able to recover it and you will loose
                            ALL access to your calendar. Make sure to remember it.
                        </p>
                        <p className="p-non-error">Confirm your secret code</p>
                        <input
                            type="password"
                            onChange={(e) => setCodeConf(e.target.value)}
                            className="create-code input-contained"
                            autoComplete="off"
                            autoCapitalize="off"
                            placeholder="Confirm your secret code"
                            required="required"
                            id="create-code-conf"
                            value={codeConf}
                        />
                        {errors["codeNotSim"] ? <p>Codes are not the same</p> : null}
                        <Checkbox txt="I agree to receive email from Kalendario" checked={Wmail} changement={(x) => setWmail(x)} />
                        <a href="/login" className="login-create-account">
                            Already have an account ?
                        </a>
                        <div className="login-btn-container create-button-container cta-button">
                            <div className="login-cancel">
                                <Button
                                    className="login-cancel create-cancel"
                                    full
                                    txt="Cancel"
                                    onClick={() => {
                                        window.location.href = "./";
                                    }}
                                />
                            </div>
                            <div className="login-submit create-submit">
                                <Button
                                    className="login-submit-btn"
                                    full
                                    txt="Create account"
                                    onClick={() => {
                                        submitData();
                                    }}
                                />
                            </div>
                        </div>
                    </>
                ) : !resended ? (
                    <div className="mail-conf-popup">
                        <h1>Please confirm your email</h1>
                        <p>Your account has been created but we need to verify your email, we've sent you an email to do so.</p>
                        <button
                            className="cta-2-log"
                            onClick={() => {
                                api.get("/re-verif")
                                    .then((res) => {
                                        if (res.status === 200) {
                                            setResended(true);
                                        }
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                            }}>
                            Resend email
                        </button>
                        <a href="/login" className="login-create-account">
                            Log-in anyway
                        </a>
                    </div>
                ) : (
                    <div className="mail-conf-popup">
                        <h1>Please confirm your email</h1>
                        <p>The email has been re-sended, if you still haven't received it, please check your spam/trash or try again later.</p>
                        <button
                            className="cta-2-log"
                            onClick={() => {
                                window.location.href = "/login";
                            }}>
                            Log-in anyway
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
