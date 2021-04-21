import React from "react";
import styles from "./camera-frame.css";

export default function CameraFrame(props: CameraFrameProps) {
  function handleClick() {
    props.onCloseCamera();
  }

  return (
    <div className={styles.frame}>
      <div className={styles.frameContent}>
        <div className={styles.closeButtonWrapper}>
          <span
            role="button"
            className={styles.close}
            onClick={(e) => handleClick()}
            tabIndex={0}
          >
            &times;
          </span>
        </div>
        {props.children}
        {!props.inPreview && (
          <div className={styles.choosePhoto}>
            <form>
              <label htmlFor="uploadPhoto" className={styles.choosePhoto}>
                Select photo
              </label>
              <input
                type="file"
                id="uploadPhoto"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => props.setSelectedFile(e.target.files[0])}
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

type CameraFrameProps = {
  children: React.ReactNode;
  inPreview: boolean;
  onCloseCamera(): void;
  setSelectedFile?(file: File): void;
};
