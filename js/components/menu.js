import React from "react";

const Menu = ({ close, children }) => {
  return (
    <div className="menu-scrim">
      <div className={"menu"}>
        {children}
        <a href="../" className="x" onClick={close} aria-label="关闭" title="关闭">×</a>
      </div>
    </div>
  );
};
export default Menu;
