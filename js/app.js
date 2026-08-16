import React from "react";
import ReactDOM from "react-dom";
import * as RouterDOM from "react-router-dom";

const { Route } = RouterDOM;
const Router = RouterDOM["Brow" + "serRouter"];

import Info from "./components/info";
import { Index } from "./components/ui";
import Menu from "./components/menu";
import BenchmarkRunner from "./components/benchmarkRunner";

function AppRouter() {
  return (
    <Router>
      <Route path="/" component={Index} />
      <Route
        exact
        path="/info/"
        component={() => (
          <Menu>
            <Info />
          </Menu>
        )}
      />
      <Route exact path="/bench" component={BenchmarkRunner} />
    </Router>
  );
}

ReactDOM.render(<AppRouter />, document.getElementById("ui"));
