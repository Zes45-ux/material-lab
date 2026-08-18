import React from "react";

import * as wasm from "../../crate/pkg/sandtable_bg.wasm";
import { Species } from "../../crate/pkg/sandtable";
const memory = wasm.memory;

import { height, universe, width, reset } from "../index.js";
import { pallette } from "../render.js";
import { svgToImageData, rgbaToSpecies } from "../convertSVG";
import { MATERIAL_GROUPS, getMaterialDetails } from "./materials";

window.species = Species;
const palletteData = pallette();

const materialColorFor = (name) => {
  if (name === "Wind") return "#c65d3b";
  return (palletteData[Species[name]] || "rgba(128, 128, 128, 0.35)").replace(
    /,\s*0\.25\)/,
    ", 0.86)"
  );
};

const speciesNameForId = (elementID) => {
  if (elementID === -1) return "Wind";
  return (
    Object.keys(Species).find(
      (name) =>
        !Number.isInteger(Number.parseInt(name)) &&
        Species[name] === elementID
    ) || "Water"
  );
};

const ElementButton = (name, selectedElement, setElement) => {
  let elementID = Species[name];
  const details = getMaterialDetails(name);
  const color = materialColorFor(name);
  const selected = elementID === selectedElement;
  let background = "transparent";

  if (elementID === 14) {
    background =
      "linear-gradient(135deg, #d56f76, #a878c8 32%, #7576c3 55%, #79c4b9 75%, #b9c375)";
  }

  return (
    <button
      type="button"
      className={selected ? "material-option selected" : "material-option"}
      key={name}
      aria-pressed={selected}
      aria-label={details.label}
      title={details.label + "，" + details.intro}
      onClick={() => setElement(elementID)}
      style={{
        "--material-color": color,
        "--material-background":
          background === "transparent" ? color : background,
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

const MaterialInspector = ({
  name,
  tab,
  setTab,
  open,
  onClose,
  panelRef,
  onKeyDown,
}) => {
  const details = getMaterialDetails(name);
  const color = materialColorFor(name);
  const selectedID = name === "Wind" ? -1 : Species[name];
  const swatchBackground =
    selectedID === 14
      ? "linear-gradient(135deg, #d56f76, #a878c8 32%, #7576c3 55%, #79c4b9 75%, #b9c375)"
      : color;

  return (
    <aside
      id="material-inspector"
      className="material-inspector"
      data-open={open ? "true" : "false"}
      ref={panelRef}
      role="dialog"
      aria-modal={open}
      aria-label="材料说明"
      aria-hidden={!open}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div className="inspector-heading">
        <div
          className="inspector-swatch"
          aria-hidden="true"
          style={{ background: swatchBackground }}
        >
          <span>{details.label.slice(0, 1)}</span>
        </div>
        <div>
          <p className="panel-kicker">当前材料</p>
          <h2>{details.label}</h2>
          <p className="inspector-code">{name}</p>
        </div>
      </div>

      <button
        type="button"
        className="inspector-close"
        onClick={onClose}
        aria-label="收起材料说明"
      >
        ×
      </button>

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
          className={
            tab === "reactions" ? "inspector-tab active" : "inspector-tab"
          }
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
            <p className="reaction-lede">
              选择一个材料，查看它在画布中的主要变化。
            </p>
            <div className="reaction-list">
              {details.reactions.map((reaction, index) => (
                <article
                  className="reaction-item"
                  key={reaction.material + "-" + index}
                >
                  <div className="reaction-material">{reaction.material}</div>
                  <div className="reaction-arrow" aria-hidden="true">
                    +
                  </div>
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

    this.mobileDockRefs = {
      materials: React.createRef(),
      brush: React.createRef(),
      inspector: React.createRef(),
    };
    this.mobilePanelRefs = {
      materials: React.createRef(),
      inspector: React.createRef(),
    };
    this.mobileSheetTrigger = null;

    this.state = {
      paused: false,
      size: 2,
      selectedElement: Species.Water,
      inspectorTab: "intro",
      inspectorOpen: false,
      mobileSheet: null,
    };

    this.selectElement = this.selectElement.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.reset = this.reset.bind(this);
    this.openMobileSheet = this.openMobileSheet.bind(this);
    this.closeMobileSheets = this.closeMobileSheets.bind(this);
    this.toggleInspector = this.toggleInspector.bind(this);
    this.handleMobileSheetKeyDown = (event) => {
      if (event.key !== "Tab" || !this.state.mobileSheet) return;

      const panelRef = this.mobilePanelRefs[this.state.mobileSheet];
      const panel = panelRef && panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusable[0] || panel;
      const last = focusable[focusable.length - 1] || panel;

      if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    this.handleInspectorKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        (this.state.inspectorOpen || this.state.mobileSheet)
      ) {
        this.closeMobileSheets();
      }
    };
    window.UI = this;
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleInspectorKeyDown);
    this.syncInspectorLayout(this.state.inspectorOpen);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleInspectorKeyDown);
    this.syncInspectorLayout(false);
    delete window.UI;
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.inspectorOpen !== this.state.inspectorOpen) {
      this.syncInspectorLayout(this.state.inspectorOpen);
    }
  }

  syncInspectorLayout(isOpen) {
    const background = document.getElementById("background");
    if (background) {
      background.dataset.inspectorOpen = isOpen ? "true" : "false";
    }
  }

  selectElement(selectedElement) {
    this.setState(
      { selectedElement, inspectorTab: "intro", mobileSheet: null },
      () => this.restoreMobileSheetFocus()
    );
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
    this.setState({ size, mobileSheet: null }, () => this.restoreMobileSheetFocus());
  }

  focusMobileSheet(name) {
    const panelRef = this.mobilePanelRefs[name];
    const panel = panelRef && panelRef.current;
    if (!panel) return;

    const firstFocusable = panel.querySelector(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    (firstFocusable || panel).focus();
  }

  restoreMobileSheetFocus() {
    const trigger = this.mobileSheetTrigger;
    this.mobileSheetTrigger = null;
    if (trigger && typeof trigger.focus === "function") {
      trigger.focus();
    }
  }

  openMobileSheet(name, trigger) {
    if (name !== "materials" && name !== "inspector") return;

    this.mobileSheetTrigger =
      trigger ||
      (this.mobileDockRefs[name] && this.mobileDockRefs[name].current) ||
      null;

    this.setState({
      mobileSheet: name,
      inspectorOpen: name === "inspector",
    }, () => this.focusMobileSheet(name));
  }

  closeMobileSheets() {
    this.setState(
      { mobileSheet: null, inspectorOpen: false },
      () => this.restoreMobileSheetFocus()
    );
  }

  toggleInspector(trigger) {
    if (this.state.inspectorOpen) {
      this.closeMobileSheets();
      return;
    }

    this.openMobileSheet("inspector", trigger);
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
    const {
      size,
      paused,
      selectedElement,
      inspectorTab,
      inspectorOpen,
      mobileSheet,
    } = this.state;
    const selectedName = speciesNameForId(selectedElement);
    const selectedColor = materialColorFor(selectedName);

    return (
      <React.Fragment>
        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              M
            </span>
            <div>
              <strong>Material Lab</strong>
              <span>材料实验台</span>
            </div>
          </div>

          <div className="canvas-status" aria-live="polite">
            <span
              className={paused ? "status-pip paused" : "status-pip"}
              aria-hidden="true"
            />
            {paused ? "已暂停" : "运行中"}
          </div>

          <nav className="topbar-actions" aria-label="画布操作">
            <button
              type="button"
              className={paused ? "topbar-button is-active" : "topbar-button"}
              onClick={() => this.togglePause()}
              aria-label={paused ? "继续" : "暂停"}
              title={paused ? "继续" : "暂停"}
            >
              <span
                className={
                  paused ? "control-glyph play-glyph" : "control-glyph pause-glyph"
                }
                aria-hidden="true"
              />
              <span>{paused ? "继续" : "暂停"}</span>
            </button>
            <button
              type="button"
              className="topbar-button"
              onClick={() => this.reset()}
            >
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

        <nav className="mobile-dock" aria-label="移动端工具">
          <button
            type="button"
            ref={this.mobileDockRefs.materials}
            className={
              mobileSheet === "materials"
                ? "mobile-dock-button is-active"
                : "mobile-dock-button"
            }
            aria-expanded={mobileSheet === "materials"}
            aria-controls="material-rail"
            onClick={(event) =>
              this.openMobileSheet("materials", event.currentTarget)
            }
          >
            <span
              className="mobile-dock-swatch"
              aria-hidden="true"
              style={{ background: selectedColor }}
            />
            <span>材料</span>
          </button>
          <button
            type="button"
            ref={this.mobileDockRefs.brush}
            className="mobile-dock-button"
            aria-controls="material-rail"
            aria-label={"笔刷大小设置，当前 " + sizeMap[size] + " px"}
            onClick={(event) =>
              this.openMobileSheet("materials", event.currentTarget)
            }
          >
            <span className="mobile-dock-icon" aria-hidden="true">
              •
            </span>
            <span>{sizeMap[size]} px</span>
          </button>
          <button
            type="button"
            ref={this.mobileDockRefs.inspector}
            className={
              mobileSheet === "inspector"
                ? "mobile-dock-button is-active"
                : "mobile-dock-button"
            }
            aria-expanded={inspectorOpen}
            aria-controls="material-inspector"
            onClick={(event) => this.toggleInspector(event.currentTarget)}
          >
            <span className="mobile-dock-icon" aria-hidden="true">
              i
            </span>
            <span>详情</span>
          </button>
        </nav>

        <button
          type="button"
          className="mobile-scrim"
          aria-label="关闭面板"
          aria-hidden={!mobileSheet}
          tabIndex={mobileSheet ? 0 : -1}
          onClick={this.closeMobileSheets}
        />

        <button
          type="button"
          className="inspector-trigger"
          aria-expanded={inspectorOpen}
          aria-controls="material-inspector"
          onClick={(event) => this.toggleInspector(event.currentTarget)}
        >
          <span aria-hidden="true">i</span>
          <span>{selectedName}</span>
        </button>

        <aside
          id="material-rail"
          className="material-rail"
          data-mobile-open={mobileSheet === "materials"}
          ref={this.mobilePanelRefs.materials}
          role="dialog"
          aria-modal={mobileSheet === "materials"}
          aria-label="材料选择"
          tabIndex={-1}
          onKeyDown={this.handleMobileSheetKeyDown}
        >
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">材料工具</p>
              <h1>选择材料</h1>
            </div>
            <div className="panel-heading-actions">
              <span className="material-count">21 种</span>
              <button
                type="button"
                className="mobile-sheet-close"
                aria-label="关闭材料选择"
                onClick={this.closeMobileSheets}
              >
                ×
              </button>
            </div>
          </div>

          <div className="material-rail-scroll">
            <button
              type="button"
              className={
                selectedElement === -1
                  ? "wind-option selected"
                  : "wind-option"
              }
              aria-pressed={selectedElement === -1}
              onClick={() => this.selectElement(-1)}
            >
              <span className="wind-glyph" aria-hidden="true">
                ↝
              </span>
              <span>
                <strong>风</strong>
                <small>推动轻质材料</small>
              </span>
            </button>

            {MATERIAL_GROUPS.map((group) => (
              <section className="material-group" data-family={group.key} key={group.key}>
                <h2>{group.label}</h2>
                <div className="material-grid">
                  {group.items.map((name) =>
                    ElementButton(name, selectedElement, this.selectElement)
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
                  onClick={(event) => this.setSize(event, i)}
                  aria-label={"笔刷大小 " + (i + 1)}
                  title={"笔刷大小 " + (i + 1)}
                  aria-pressed={i === size}
                >
                  <span
                    style={{
                      width: Math.max(4, Math.min(22, 4 + v / 2)) + "px",
                      height: Math.max(4, Math.min(22, 4 + v / 2)) + "px",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <MaterialInspector
          name={selectedName}
          tab={inspectorTab}
          setTab={(tab) => this.setState({ inspectorTab: tab })}
          open={inspectorOpen}
          onClose={this.closeMobileSheets}
          panelRef={this.mobilePanelRefs.inspector}
          onKeyDown={this.handleMobileSheetKeyDown}
        />
      </React.Fragment>
    );
  }
}

export { sizeMap, Index };
