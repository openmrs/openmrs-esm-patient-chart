import React, { useState } from "react";
import styles from "./show-more-card.css";

export default function HeightAndWeightFooter(
  props: HeightAndWeightFooterProps
) {
  const [more, setMore] = React.useState(true);
  const clickHandler = () => {
    props.func();
    setMore(false);
  };
  return (
    <div className={styles.conditionMore}>
      {(more && (
        <svg
          className={`omrs-icon ${styles.icon}`}
          fill="var(--omrs-color-ink-low-contrast)"
        >
          <use xlinkHref="#omrs-icon-chevron-down" />
        </svg>
      )) || (
        <svg
          className={`omrs-icon ${styles.icon}`}
          fill="var(--omrs-color-ink-low-contrast)"
        >
          <use xlinkHref="#omrs-icon-chevron-right" />
        </svg>
      )}
      <button onClick={clickHandler} className={styles.moreBtn}>
        {more ? "More" : "Show all"}
      </button>
    </div>
  );
}

type HeightAndWeightFooterProps = {
  func: Function;
};
