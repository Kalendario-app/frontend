import React, { useState } from "react";
import { Button } from "./Button";
import { sha256 } from "js-sha256";
import axios from "axios";
import { api } from "./Main";

axios.defaults.withCredentials = true;

export const Login = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [isError, setIsError] = useState(false);

    function submitData() {
        var mdp = login + "sel" + password;
        mdp = sha256(mdp);
        api.get("/login?mdp=" + mdp)
            .then((response) => {
                if (response.status === 200) {
                    window.location.href = "./calendar";
                }
            })
            .catch((err) => {
                console.log(err);
                setIsError(true);
            });
    }
    function redirectHome() {
        window.location.href = "/";
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Log-in to Kalendario</h1>
                {isError ? <p>There is a problem with the email or the password.</p> : null}
                <input
                    onChange={(event) => setLogin(event.target.value)}
                    type="email"
                    autoComplete="off"
                    autoCapitalize="off"
                    className="login-email input-contained"
                    autoFocus="autofocus"
                    placeholder="Email"
                    required="required"
                />
                <input
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="off"
                    autoCapitalize="off"
                    className="login-password input-contained"
                    placeholder="Password"
                    required="required"
                />
                <a href="/create-account" className="login-create-account">
                    Don't have an account ?
                </a>
                <div className="login-btn-container cta-button">
                    <div className="login-cancel">
                        <Button
                            className="login-cancel"
                            full
                            txt="Cancel"
                            onClick={() => {
                                redirectHome();
                            }}
                        />
                    </div>
                    <div className="login-submit">
                        <Button
                            className="login-submit-btn"
                            full
                            txt="Login"
                            onClick={() => {
                                submitData();
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
