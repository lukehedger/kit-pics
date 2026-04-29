import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";
import "./style.css";
import About from "./About";
import App from "./App";
import Stats from "./Stats";
import Timeline from "./Timeline";
import * as serviceWorker from "./serviceWorker";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Route path="/" exact component={App} />
      <Route path="/about/" component={About} />
      <Route path="/stats/" component={Stats} />
      <Route path="/timeline/" component={Timeline} />
    </BrowserRouter>
  );
};

ReactDOM.render(<AppRouter />, document.getElementById("root"));

serviceWorker.register();
