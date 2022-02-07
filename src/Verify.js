import React, { useState } from "react";
import { api } from "./Main";
import { useLocation } from "react-router-dom";

export const Verify = () => {
    const key = new URLSearchParams(useLocation().search).get("key");

    const [etat, setEtat] = useState(0);

    //todo redirect to login if key is valid

    api.get("/verify?key=" + key)
        .then((response) => {
            if (response.status === 200) {
                setEtat(1);
            }
        })
        .catch((err) => {
            setEtat(2);
            console.log(err);
        });

    return (
        <div>
            {etat === 0 ? (
                <h1>Veriying</h1>
            ) : etat === 1 ? (
                <div className="verification">
                    <h1>Your email has been successfully verified</h1>
                    <p>You can now login</p>
                    <button className="button-full" onClick={() => (window.location.href = "/login")}>
                        Login
                    </button>
                </div>
            ) : (
                <div className="verification">
                    <h1>There was en error verifying your mail</h1>
                    <p>Please check the link of try again later</p>
                    <button className="button-full" onClick={() => (window.location.href = "/")}>
                        Go back home
                    </button>
                </div>
            )}
        </div>
    );
};
