import React from 'react';
import { EmptyDataIllustration } from './empty-illustration';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Tile, Link, Layer } from '@carbon/react';

import styles from './empty-state.scss';

interface EmptyStateProps {
  headerTitle: string;
  displayText?: string;
  launchForm?: () => void;
  launchFormComponent?: any;
  hideFormLauncher?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  headerTitle,
  displayText,
  launchFormComponent,
  hideFormLauncher = true,
  launchForm,
}) => {
  const { t } = useTranslation();
  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={styles.headerWrapper}>
          <h1 className={styles.heading}>{headerTitle}</h1>
          {launchFormComponent}
        </div>
        <div className={styles.contentWrapper}>
          <EmptyDataIllustration />
          <p className={styles.content}>
            <Trans i18nKey="emptyStateText" values={{ displayText: displayText.toLowerCase() }}>
              There are no {displayText.toLowerCase()} to display
              {displayText.toLowerCase() != 'patients' ? ' for this patient' : ''}
            </Trans>
          </p>
          {launchFormComponent && !hideFormLauncher && (
            <p className={styles.action}>
              <Link onClick={() => launchForm()}>
                {t('record', 'Record')} {displayText.toLowerCase()}
              </Link>
            </p>
          )}
        </div>
        {/* @ts-ignore */}
        <Button kind="ghost" displayText={t('add', 'Add')} id="choose-intent" label={t('add', 'Add +')}></Button>
      </Tile>
    </Layer>
  );
};
