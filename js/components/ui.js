import React from "react";
import { Link } from "react-router-dom";
import * as Sentry from "@sentry/browser";

import * as wasm from "../../crate/pkg/sandtable_bg.wasm";
import { Species } from "../../crate/pkg/sandtable";
const memory = wasm.memory;

import { height, universe, width, reset } from "../index.js";
import { snapshot, pallette } from "../render.js";
import { functions, storage } from "../api.js";
import SignInButton from "./signinButton.js";
import { svgToImageData, rgbaToSpecies } from "../convertSVG";
import { MATERIAL_GROUPS, getMaterialDetails } from "./materials";

import Menu from "./menu";

window.species = Species;
let pallette_data = pallette();

const ElementButton = (name, selectedElement, setElement) => {
  let elementID = Species[name];

  let color = pallette_data[elementID] || "rgba(128, 128, 128, 0.35)";
  let solidColor = color.replace(/,\s*0\.25\)/, ", 0.86)");
  let selected = elementID == selectedElement;
  let details = getMaterialDetails(name);

  let background = "transparent";
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
      type="button"
      className={`material-option ${selected ? "selected" : ""}`}
      key={name}
      aria-pressed={selected}
      title={`${details.label}，${details.intro}`}
      onClick={() => {
        setElement(elementID);
      }}
      style={{
        "--material-color": solidColor,
        "--material-background": background === "transparent" ? solidColor : background,
      }}
    >
      <span className="material-swatch" aria-hidden="true" />
      <span className="material-option-copy">
        <span className="material-option-label">{details.label}</span>
        <span className="material-option-code">{name}</span>
      </span>
    </button>
  );
};

const speciesNameForId = (elementID) => {
  if (elementID === -1) return "Wind";
  return (
    Object.keys(Species).find(
      (name) => !Number.isInteger(Number.parseInt(name)) && Species[name] === elementID
    ) || "Water"
  );
};

const materialColorFor = (name) => {
  if (name === "Wind") return "#c65d3b";
  return (pallette_data[Species[name]] || "rgba(128, 128, 128, 0.35)").replace(
    /,\s*0\.25\)/,
    ", 0.86)"
  );
};

const MaterialInspector = ({ name, tab, setTab }) => {
  const details = getMaterialDetails(name);
  const color = materialColorFor(name);
  const selectedID = name === "Wind" ? -1 : Species[name];
  const swatchBackground = selectedID === 14
    ? "linear-gradient(135deg, #d56f76, #a878c8 32%, #7576c3 55%, #79c4b9 75%, #b9c375)"
    : color;

  return (
    <aside className="material-inspector" aria-label="材料说明">
      <div className="inspector-heading">
        <div
          className="inspector-swatch"
          aria-hidden="true"
          style={{ background: swatchBackground }}
        >
          <span>{name === "Wind" ? "风" : details.label.slice(0, 1)}</span>
        </div>
        <div>
          <p className="panel-kicker">当前材料</p>
          <h2>{details.label}</h2>
          <p className="inspector-code">{name}</p>
        </div>
      </div>

      <div className="inspector-tabs" role="tablist" aria-label="材料信息层级">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "intro"}
          className={tab === "intro" ? "inspector-tab active" : "inspector-tab"}
          onClick={() => setTab("intro")}
        >
          简介
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "reactions"}
          className={tab === "reactions" ? "inspector-tab active" : "inspector-tab"}
          onClick={() => setTab("reactions")}
        >
          反应
        </button>
      </div>

      <div className="inspector-content" role="tabpanel">
        {tab === "intro" ? (
          <div className="intro-content">
            <p className="material-intro">{details.intro}</p>
            <div className="inspector-note">
              <span className="note-mark" aria-hidden="true" />
              <p>{details.note}</p>
            </div>
            <div className="material-facts">
              <span>类别</span>
              <strong>{details.family}</strong>
            </div>
          </div>
        ) : (
          <div className="reaction-content">
            <p className="reaction-lede">选择一个材料，查看它在画布中的主要变化。</p>
            <div className="reaction-list">
              {details.reactions.map((reaction, index) => (
                <article className="reaction-item" key={`${reaction.material}-${index}`}>
                  <div className="reaction-material">{reaction.material}</div>
                  <div className="reaction-arrow" aria-hidden="true">+</div>
                  <div className="reaction-result">{reaction.result}</div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

let sizeMap = [1, 3, 7, 19, 39];

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submissionMenuOpen: false,
      paused: false,
      submitting: false,
      size: 2,
      dataURL: {},
      currentSubmission: null,
      selectedElement: Species.Water,
      inspectorTab: "intro",
    };
    window.UI = this;
    //if we start in the background, pause;
    if (
      this.props.location.pathname !== "/" &&
      this.props.location.pathname !== "/school"
    ) {
      window.setTimeout(() => this.pause(), 50);
    }

    this.load();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.location.pathname === "/" &&
      prevProps.location.pathname !== "/" &&
      this.state.currentSubmission
    ) {
      window.location = `#${this.state.currentSubmission.id}`;
      return;
    }
    if (
      this.props.location.pathname !== "/" &&
      prevProps.location.pathname == "/"
    ) {
      this.pause();
    }
    if (
      prevProps.location.hash === "" ||
      prevProps.location.hash != this.props.location.hash
    ) {
      this.load();
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
    this.setState({
      size,
    });
  }
  reset() {
    if (window.confirm("Are you sure you want to reset?")) {
      this.play();
      window.location = "#";
      this.setState({ currentSubmission: null });
      reset();
    }
  }
  menu() {
    this.pause();
    this.setState({ submissionMenuOpen: true });
  }

  closeMenu() {
    this.play();
    this.setState({ submissionMenuOpen: false });
  }
  upload() {
    let dataURL = snapshot(universe);
    const cells = new Uint8Array(
      memory.buffer,
      universe.cells(),
      width * height * 4
    );

    // Create canvas
    let canvas = document.createElement("canvas"),
      context = canvas.getContext("2d"),
      imgData = context.createImageData(width, height);

    canvas.height = height;
    canvas.width = width;

    // fill imgData with data from cells
    // transpose for historical compatability
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let cell_index = (y + x * height) * 4;
        let img_index = (x + y * width) * 4;
        for (var i = 0; i < 4; i++) {
          if (i % 4 == 3) {
            imgData.data[img_index + i] = 255;
          } else {
            imgData.data[img_index + i] = cells[cell_index + i];
          }
        }
      }
    }
    // put data to context at (0, 0)
    context.putImageData(imgData, 0, 0);

    let cellData = canvas.toDataURL("image/png");

    this.pause();
    this.setState({
      data: { dataURL, cells: cellData },
      submissionMenuOpen: true,
    });
  }
  rateLimited() {
    var postList = JSON.parse(localStorage.getItem("postList") || "[]");
    postList = postList.filter((post) => Date.now() - 1000 * 60 * 5 < post);

    if (postList.length >= 3) {
      Sentry.captureMessage("RATELIMIT");
      return true;
    }
    return false;
  }
  submit() {
    let { title, data, currentSubmission } = this.state;

    let { dataURL, cells } = data;
    let { currentUser } = firebase.auth();
    title = title.replace(
      "[profile]",
      `https://sandspiel.club/browse/search/?user=${currentUser.uid}`
    );

    let payload = {
      title,
      image: dataURL,
      parent_id: currentSubmission?.data?.id,
      cells,
    };

    var postList = JSON.parse(localStorage.getItem("postList") || "[]");

    postList = postList.filter((post) => Date.now() - 1000 * 60 * 3 < post);
    postList.push(Date.now());
    localStorage.setItem("postList", JSON.stringify(postList));

    this.setState({ submitting: true });
    currentUser.getIdToken().then((token) => {
      fetch(functions._url("api/creations"), {
        method: "POST",
        body: JSON.stringify(payload), // data can be `string` or {object}!
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
        .then((res) => res.json())
        .then((response) => {
          console.log("Success:", JSON.stringify(response));
          this.play();
        })
        .catch((error) => console.error("Error:", error))
        .then(() => {
          this.setState({ submissionMenuOpen: false, submitting: false });
        });
    });
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
      cellsData[i] = species; // should be 0 to 19
      cellsData[i + 1] = Math.floor(100 + Math.random() * 50); // register A
      cellsData[i + 2] = 0; // register B
      cellsData[i + 3] = 0; // clock
    }
    universe.flush_undos();
    universe.push_undo();

    this.pause();
  }

  load() {
    let { location } = this.props;
    let id = location.hash.replace(/#/, "");
    if (id === "") {
      return;
    }

    if (this.state.currentSubmission && this.state.currentSubmission.id == id) {
      return;
    }

    fetch(functions._url(`api/creations/${id}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        storage
          .refFromURL(
            `gs://sandtable-8d0f7.appspot.com/creations/${data.id}.data.png`
          )
          .getDownloadURL()
          .then((dlurl) => {
            fetch(dlurl, {
              method: "GET",
            })
              .then((res) => res.blob())
              .then((blob) => {
                this.setState({ currentSubmission: { id, data } });

                var url = URL.createObjectURL(blob);
                var img = new Image();
                img.src = url;
                img.onload = () => {
                  var canvas = document.createElement("canvas");
                  canvas.width = width;
                  canvas.height = height;
                  var ctx = canvas.getContext("2d");

                  ctx.translate(canvas.width / 2, canvas.height / 2);
                  ctx.rotate((-90 * Math.PI) / 180);
                  ctx.scale(-1, 1.0);
                  ctx.translate(-canvas.width / 2, -canvas.height / 2);

                  ctx.drawImage(img, 0, 0);
                  var imgData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );

                  const cellsData = new Uint8Array(
                    memory.buffer,
                    universe.cells(),
                    width * height * 4
                  );

                  reset();
                  window.stopboot = true;

                  for (var i = 0; i < width * height * 4; i++) {
                    cellsData[i] = imgData.data[i];
                  }
                  universe.flush_undos();
                  universe.push_undo();
                  this.pause();
                };
              })
              .catch((error) => console.error("Error:", error));
          });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  incScore() {
    let { currentSubmission } = this.state;
    let { id } = currentSubmission;
    // creations/:id/vote
    firebase
      .auth()
      .currentUser.getIdToken()
      .then((token) => {
        fetch(functions._url(`api/creations/${id}/vote`), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (currentSubmission != null) {
              this.setState({
                currentSubmission: { ...currentSubmission, data },
              });
            }
          })
          .catch((e) => {
            console.error(e);
          });
      });
  }

  render() {
    let { size, paused, selectedElement, currentSubmission, inspectorTab } = this.state;
    let selectedName = speciesNameForId(selectedElement);
    let hash =
      currentSubmission && currentSubmission.id
        ? `#${currentSubmission.id}`
        : "";
    return (
      <React.Fragment>
        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">s</span>
            <div>
              <strong>sandspiel</strong>
              <span>材料实验台</span>
            </div>
          </div>
          <div className="canvas-status" aria-live="polite">
            <span className={paused ? "status-pip paused" : "status-pip"} aria-hidden="true" />
            {paused ? "已暂停" : "运行中"}
          </div>
          <nav className="topbar-actions" aria-label="画布操作">
            <button
              type="button"
              onClick={() => this.togglePause()}
              className={paused ? "topbar-button is-active" : "topbar-button"}
              aria-label={paused ? "继续模拟" : "暂停模拟"}
              title={paused ? "继续模拟" : "暂停模拟"}
            >
              <span className={paused ? "control-glyph play-glyph" : "control-glyph pause-glyph"} aria-hidden="true" />
              <span>{paused ? "继续" : "暂停"}</span>
            </button>
            {!window.location.pathname.includes("school") && (
              <>
                <button type="button" className="topbar-button" onClick={() => this.upload()}>
                  上传
                </button>
                <Link
                  className="topbar-button"
                  to={{
                    pathname: "/browse/",
                    hash,
                  }}
                >
                  作品
                </Link>
              </>
            )}
            <button type="button" className="topbar-button" onClick={() => this.reset()}>
              重置
            </button>
            <button
              type="button"
              className="topbar-button icon-only"
              onClick={() => {
                reset();
                universe.pop_undo();
              }}
              aria-label="撤销"
              title="撤销"
            >
              ↶
            </button>
          </nav>
        </header>

        <aside className="material-rail" aria-label="材料选择">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">材料工具</p>
              <h1>选择材料</h1>
            </div>
            <span className="material-count">19 种</span>
          </div>
          <div className="material-rail-scroll">
            <button
              type="button"
              className={selectedElement === -1 ? "wind-option selected" : "wind-option"}
              aria-pressed={selectedElement === -1}
              onClick={() => this.setState({ selectedElement: -1, inspectorTab: "intro" })}
            >
              <span className="wind-glyph" aria-hidden="true">↝</span>
              <span>
                <strong>风</strong>
                <small>推动轻质材料</small>
              </span>
            </button>
            {MATERIAL_GROUPS.map((group) => (
              <section className="material-group" key={group.label}>
                <h2>{group.label}</h2>
                <div className="material-grid">
                  {group.items.map((name) =>
                    ElementButton(name, selectedElement, (id) =>
                      this.setState({ selectedElement: id, inspectorTab: "intro" })
                    )
                  )}
                </div>
              </section>
            ))}
          </div>
          <div className="brush-control">
            <div className="brush-heading">
              <span>笔刷大小</span>
              <output>{sizeMap[size]} px</output>
            </div>
            <div className="brush-size-grid" role="group" aria-label="笔刷大小">
              {sizeMap.map((v, i) => (
                <button
                  type="button"
                  key={i}
                  className={i === size ? "brush-size selected" : "brush-size"}
                  onClick={(e) => this.setSize(e, i)}
                  aria-label={`笔刷大小 ${v}`}
                  aria-pressed={i === size}
                >
                  <span style={{ width: `${Math.max(4, Math.min(22, 4 + v / 2))}px`, height: `${Math.max(4, Math.min(22, 4 + v / 2))}px` }} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <MaterialInspector
          name={selectedName}
          tab={inspectorTab}
          setTab={(tab) => this.setState({ inspectorTab: tab })}
        />

        {this.state.currentSubmission && (
          <div className="submission-title">
            <button onClick={() => this.incScore()}>
              +♡{this.state.currentSubmission.data.score}{" "}
            </button>
            {this.state.currentSubmission.data.title}
          </div>
        )}

        {this.state.submissionMenuOpen && (
          <Menu close={() => this.closeMenu()}>
            <h4>分享你的作品</h4>
            <p>给作品写一个标题，然后发布到作品浏览页。</p>
            <img src={this.state.data.dataURL} className="submissionImg" />
            <SignInButton>
              <div style={{ display: "flex" }}>
                <input
                  maxlength="200"
                  placeholder="作品标题"
                  onChange={(e) => this.setState({ title: e.target.value })}
                />
                <button
                  disabled={this.state.submitting || this.rateLimited()}
                  onClick={() => this.submit()}
                >
                  发布
                </button>
              </div>
            </SignInButton>
          </Menu>
        )}
      </React.Fragment>
    );
  }
}

export { sizeMap, Index };
