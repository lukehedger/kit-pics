import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";
import "./style.css";
import App from "./App";
import Stats from "./Stats";
import * as serviceWorker from "./serviceWorker";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Route path="/" exact component={App} />
      <Route path="/stats/" component={Stats} />
    </BrowserRouter>
  );
};

ReactDOM.render(<AppRouter />, document.getElementById("root"));

serviceWorker.register();
