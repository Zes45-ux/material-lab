import React from "react";
import { Link } from "react-router-dom";

const Menu = ({ close, children }) => {
  return (
    <div className="menu-scrim">
      <div className={"menu"}>
        {children}
        <Link to="/" className="x" onClick={close}>
          <button aria-label="关闭" title="关闭">×</button>
        </Link>
      </div>
    </div>
  );
};
export default Menu;
