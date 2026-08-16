import React from "react";
import ReactDOM from "react-dom";

import Info from "./components/info";
import { Index } from "./components/ui";
import Menu from "./components/menu";
import BenchmarkRunner from "./components/benchmarkRunner";
import { pageView } from "./page-view";

const view = pageView === "info" ? (
  <Menu><Info /></Menu>
) : pageView === "bench" ? (
  <BenchmarkRunner />
) : (
  <Index />
);

ReactDOM.render(view, document.getElementById("ui"));
