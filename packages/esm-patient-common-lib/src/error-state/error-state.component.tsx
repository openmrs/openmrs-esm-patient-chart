import React from "react";
import styles from "./error-state.scss";
import { Tile } from "carbon-components-react/es/components/Tile";
import { useTranslation } from "react-i18next";

export interface ErrorStateProps {
  error: any;
  headerTitle: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  headerTitle,
}) => {
  const { t } = useTranslation();

  return (
    <Tile light className={styles.tile}>
      <h1 className={styles.heading}>{headerTitle}</h1>
      <p className={styles.errorMessage}>
        {t("error", "Error")} {`${error?.response?.status}: `}
        {error?.response?.statusText}
      </p>
      <p className={styles.errorCopy}>{t("errorCopy")}</p>
    </Tile>
  );
};
