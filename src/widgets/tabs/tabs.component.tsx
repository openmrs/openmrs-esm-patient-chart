import React from "react";
import styles from "./tabs.component.css";

export function Tabs(props) {
  function removeTab($event, index) {
    $event.stopPropagation();
    props.removeTab(index);
  }
  return (
    <div>
      <div className={styles.tabs}>
        {Array.isArray(props.children) ? (
          props.children.map((elem, index) => {
            return (
              <button
                className={`omrs-unstyled ${
                  index == props.selected ? styles.selected : ""
                }`}
                key={index}
                onClick={() => props.setSelected(index)}
              >
                {elem.props.title}
                <button
                  onClick={$event => removeTab($event, index)}
                  className={`${styles.closeIcon} omrs-unstyled omrs-btn-icon-small`}
                >
                  <svg className="omrs-icon">
                    <use xlinkHref="#omrs-icon-close"></use>
                  </svg>
                </button>
              </button>
            );
          })
        ) : (
          <div className={styles.selected}>{props.children.title}</div>
        )}
      </div>
      <div className={styles.panel}>{props.children}</div>
    </div>
  );
}

export function Panel(props) {
  return <div style={props.style}>{props.children}</div>;
}
