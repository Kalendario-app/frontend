import { Main } from "./Main";
import { Router, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Login } from "./Login";
import { CreateAccount } from "./CreateAccount";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { HomePage } from "./HomePage";
import { Verify } from "./Verify";

function App() {
    const history = createBrowserHistory();
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="container">
                <Router history={history}>
                    <Route exact path="/" component={HomePage} />
                    <Route path="/calendar" component={Main} />
                    <Route path="/login" component={Login} />
                    <Route path="/create-account" component={CreateAccount} />
                    <Route path="/verify" component={Verify} />
                </Router>
            </div>
        </DndProvider>
    );
}

export default App;
