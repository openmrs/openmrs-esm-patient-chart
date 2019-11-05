import React, { useState } from "react";
import styles from "./show-more-card.css";
export default function ShowMoreCard(props: ShowMoreCardProps) {
  const [message, setMessage] = React.useState("More");
  const clickHandler = () => {
    props.func();
    message === "More" ? setMessage("Less") : setMessage("More");
  };
  return (
    <div className={styles.moreBtn}>
      <button onClick={() => clickHandler()}>{message}</button>
    </div>
  );
}

type ShowMoreCardProps = {
  func: Function;
};
