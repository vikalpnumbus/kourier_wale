import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import "./Tooltip.css";

const Tooltip = ({ children, content, position }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({});
  const wrapperRef = useRef(null);

  const showTooltip = () => {
    const rect = wrapperRef.current.getBoundingClientRect();
    setCoords(rect);
    setIsVisible(true);
  };
  const hideTooltip = () => setIsVisible(false);

  return (
    <div
      ref={wrapperRef}
      className="tooltip-wrapper"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible &&
        ReactDOM.createPortal(
          <div
            className={`tooltip-box tooltip-${position}`}
            style={{
              top:
                position === "top"
                  ? coords.top - 8
                  : position === "bottom"
                  ? coords.bottom + 8
                  : coords.top + coords.height / 2,
              left:
                position === "left"
                  ? coords.left - 8
                  : position === "right"
                  ? coords.right + 8
                  : coords.left + coords.width / 2,
              position: "fixed",
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Tooltip;
