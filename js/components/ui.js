import React from "react";
import { Link } from "react-router-dom";

import * as wasm from "../../crate/pkg/sandtable_bg.wasm";
import { Species } from "../../crate/pkg/sandtable";
import elementLabels from "../element-labels.json";
const memory = wasm.memory;

import { height, universe, width, reset } from "../index.js";
import { pallette } from "../render.js";
import { svgToImageData, rgbaToSpecies } from "../convertSVG";

window.species = Species;
let pallette_data = pallette();

const ElementButton = (name, selectedElement, setElement) => {
  let elementID = Species[name];

  let color = pallette_data[elementID];
  let selected = elementID == selectedElement;

  let background = "inherit";
  if (elementID == 14) {
    background = `linear-gradient(45deg, 
    rgba(202, 121, 125, 0.25), 
    rgba(169, 120, 200, 0.25), 
    rgba(117, 118, 195, 0.25), 
    rgba(117, 196, 193, 0.25), 
    rgba(122, 203, 168, 0.25), 
    rgba(185, 195, 117, 0.25), 
    rgba(204, 186, 122, 0.25))`;
    if (selected) {
      background = background.replace(/0.25/g, "1.0");
    }
  }
  return (
    <button
      className={selected ? "selected" : ""}
      key={name}
      onClick={() => {
        setElement(elementID);
      }}
      style={{
        background,
        backgroundColor: selected ? color.replace("0.25", "1.5") : color,
      }}
      aria-label={elementLabels[name]}
    >
      {elementLabels[name]}
    </button>
  );
};

let sizeMap = [1, 3, 7, 19, 39];

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      paused: false,
      size: 2,
      selectedElement: Species.Water,
    };
    window.UI = this;
    //if we start in the background, pause;
    if (
      this.props.location.pathname !== "/" &&
      this.props.location.pathname !== "/school"
    ) {
      window.setTimeout(() => this.pause(), 50);
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.location.pathname !== "/" &&
      prevProps.location.pathname == "/"
    ) {
      this.pause();
    }
  }

  togglePause() {
    window.paused = !this.state.paused;
    this.setState({ paused: !this.state.paused });
  }

  play() {
    window.paused = false;
    this.setState({ paused: false });
  }

  pause() {
    window.paused = true;
    this.setState({ paused: true });
  }

  setSize(event, size) {
    event.preventDefault();
    this.setState({ size });
  }

  reset() {
    if (window.confirm("确定要重置沙盒吗？")) {
      this.play();
      reset();
    }
  }

  async loadSVG(svgString) {
    const imgData = await svgToImageData(svgString);

    const cellsData = new Uint8Array(
      memory.buffer,
      universe.cells(),
      width * height * 4
    );

    reset();
    window.stopboot = true;

    for (let i = 0, len = width * height * 4; i < len; i += 4) {
      const species = rgbaToSpecies(
        imgData.data[i],
        imgData.data[i + 1],
        imgData.data[i + 2],
        imgData.data[i + 3]
      );
      cellsData[i] = species;
      cellsData[i + 1] = Math.floor(100 + Math.random() * 50);
      cellsData[i + 2] = 0;
      cellsData[i + 3] = 0;
    }
    universe.flush_undos();
    universe.push_undo();

    this.pause();
  }

  render() {
    let { size, paused, selectedElement } = this.state;
    return (
      <React.Fragment>
        <button
          onClick={() => this.togglePause()}
          className={paused ? "selected" : ""}
          aria-label={paused ? "继续" : "暂停"}
          title={paused ? "继续" : "暂停"}
        >
          {paused ? (
            <svg height="20" width="20" id="d" viewBox="0 0 300 300">
              <polygon id="play" points="0,0 , 300,150 0,300" />
            </svg>
          ) : (
            <svg height="20" width="20" id="d" viewBox="0 0 300 300">
              <polygon id="bar2" points="0,0 110,0 110,300 0,300" />
              <polygon id="bar1" points="190,0 300,0 300,300 190,300" />
            </svg>
          )}
        </button>

        <button onClick={() => this.reset()}>重置</button>
        <Link to={{ pathname: "/info/" }}>
          <button>说明</button>
        </Link>

        {/* {paused && <button onClick={() => universe.tick()}>Tick</button>} */}
        <span className="sizes">
          {sizeMap.map((v, i) => (
            <button
              key={i}
              className={i == size ? "selected" : ""}
              onClick={(e) => this.setSize(e, i)}
              style={{ padding: "0px" }}
              aria-label={`笔刷大小 ${i + 1}`}
              title={`笔刷大小 ${i + 1}`}
            >
              <svg height="23" width="23" id="d" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={3 + v} />
              </svg>
            </button>
          ))}
        </span>
        <button
          onClick={() => {
            reset();
            universe.pop_undo();
          }}
          style={{ fontSize: 35 }}
          aria-label="撤销"
          title="撤销"
        >
          ↜
        </button>
        <button
          className={-1 == selectedElement ? "selected" : ""}
          onClick={() => {
            this.setState({ selectedElement: -1 });
          }}
        >
          风
        </button>
        {Object.keys(Species)
          .filter((x) => !Number.isInteger(Number.parseInt(x)))
          .map((n) =>
            ElementButton(n, selectedElement, (id) =>
              this.setState({ selectedElement: id })
            )
          )}
      </React.Fragment>
    );
  }
}

export { sizeMap, Index };
