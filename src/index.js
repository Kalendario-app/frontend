import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
// import { CookiesProvider } from "react-cookie";

const rootElement = document.getElementById("root");

//rootElement.innerHTML("");
ReactDOM.render(<App />, rootElement);

/*ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);*/
