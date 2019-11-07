import React, { useState } from "react";
import styles from "./show-more-card.css";

export default function ShowMoreCard(props: ShowMoreCardProps) {
  const [more, setMore] = React.useState(true);
  const clickHandler = () => {
    props.func();
    setMore(!more);
  };
  return (
    <div>
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
          <use xlinkHref="#omrs-icon-chevron-up" />
        </svg>
      )}
      <button className={styles.moreBtn} onClick={clickHandler}>
        {more ? "More" : "Less"}
      </button>
    </div>
  );
}

type ShowMoreCardProps = {
  func: Function;
};
