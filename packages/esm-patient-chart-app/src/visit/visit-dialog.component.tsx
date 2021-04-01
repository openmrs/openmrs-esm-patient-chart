import React, { useState, useEffect } from "react";
import styles from "./visit-dialog.css";
import isEmpty from "lodash-es/isEmpty";
import { ModalItem, getModalItem } from "./visit-dialog.resource";

const VisitDialog: React.FC = () => {
  const [child, setChild] = useState<React.ReactNode>(null);
  const [childProps, setChildProps] = useState<any>(null);

  const toggleDisplay = () => {
    setChild(!isEmpty(childProps));
  };

  useEffect(() => {
    getModalItem().subscribe((item: ModalItem) => {
      setChild(item.component);
      setChildProps(item.props);
    });
  }, [child]);

  return (
    <div className={!isEmpty(child) ? styles.visitModal : styles.hideModal}>
      <div className={styles.visitModalContent}>
        <div className={styles.closeButtonContainer}>
          <svg
            className="omrs-icon"
            fill="var(--omrs-color-danger)"
            onClick={() => toggleDisplay()}
          >
            <use xlinkHref="#omrs-icon-close"></use>
          </svg>
        </div>
        {child}
      </div>
    </div>
  );
};

export default VisitDialog;
