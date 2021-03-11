import React from "react";
import Link from "carbon-components-react/es/components/Link";
import { Tile } from "carbon-components-react/es/components/Tile";
import EmptyDataIllustration from "./empty-data-illustration.component";
import styles from "./empty-state.scss";
import { Trans, useTranslation } from "react-i18next";

interface EmptyStateProps {
  headerTitle: string;
  displayText: string;
  launchForm?(): void;
}

const EmptyState: React.FC<EmptyStateProps> = props => {
  const { t } = useTranslation();

  return (
    <Tile light className={styles.tile}>
      <h1 className={styles.heading}>{props.headerTitle}</h1>
      <EmptyDataIllustration />
      <p className={styles.content}>
        <Trans
          i18nKey="emptyStateText"
          values={{ displayText: props.displayText.toLowerCase() }}
        >
          There are no {props.displayText.toLowerCase()} to display for this
          patient
        </Trans>
      </p>
      <p className={styles.action}>
        <Link onClick={() => props.launchForm()}>
          {t("record", "Record")} {props.displayText.toLowerCase()}
        </Link>
      </p>
    </Tile>
  );
};

export default EmptyState;
