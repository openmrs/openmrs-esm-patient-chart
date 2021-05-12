import React from "react";
import ReactDOM from "react-dom";

export const Modal: React.FC = ({ children }) => {
  const [container, setConatiner] = React.useState<HTMLElement>(null);

  React.useEffect(() => {
    const div = document.body.appendChild(document.createElement("div"));
    div.style.zIndex = "10000";
    div.style.height = "100vh";
    div.style.width = "100vw";
    div.style.overflow = "hidden";
    div.style.position = "relative";
    setConatiner(div);
    return () => {
      setTimeout(() => div.remove(), 0);
    };
  }, []);
  if (container) return ReactDOM.createPortal(children, container);
  return <div></div>;
};
