import React from "react";
import ReactDOM from "react-dom";

import Info from "./components/info";
import { Index } from "./components/ui";
import Menu from "./components/menu";
import BenchmarkRunner from "./components/benchmarkRunner";

const route = window.location.pathname.replace(/\/+$/, "");
const view = route.endsWith("/info") ? (
  <Menu><Info /></Menu>
) : route.endsWith("/bench") ? (
  <BenchmarkRunner />
) : (
  <Index />
);

ReactDOM.render(view, document.getElementById("ui"));
