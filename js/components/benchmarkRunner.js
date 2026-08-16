import React from "react";
import { runBenchmark } from "../benchmark";

class BenchmarkRunner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { lines: ["测试中："], show: true };
  }
  componentDidMount() {
    this.run();
  }
  run() {
    runBenchmark((newline) =>
      this.setState(({ lines }) => {
        return {
          lines: [...lines, newline],
        };
      })
    );
  }

  render() {
    let { lines, show } = this.state;

    if (!show) {
      return null;
    }
    return (
      <div className="benchmark">
        <pre>{lines.join("\n")}</pre>
        <span>
          <button
            onClick={() => {
              this.run();
            }}
          >
            {" "}
            重新测试
          </button>
          {"    "}
          <button onClick={() => this.setState({ show: false })}>关闭</button>
        </span>
      </div>
    );
  }
}
export default BenchmarkRunner;
