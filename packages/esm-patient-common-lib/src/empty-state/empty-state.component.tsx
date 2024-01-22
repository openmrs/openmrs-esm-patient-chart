import React from 'react';
import { Layer, Link, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './empty-state.scss';
import { Button } from '@carbon/react';

export interface EmptyStateProps {
  displayText: string;
  headerTitle: string;
  launchForm?(): void;
}

export const EmptyState: React.FC<EmptyStateProps> = (props) => {
  const { t } = useTranslation('@openmrs/esm-patient-chart-app');
  const isTablet = useLayoutType() === 'tablet';

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{props.headerTitle}</h4>
        </div>
        <EmptyDataIllustration />
        <p className={styles.content}>
          {t('emptyStateText', 'There are no {{displayText}} to display for this patient', {
            displayText: props.displayText.toLowerCase(),
          })}
        </p>
        <p className={styles.action}>
          {props.launchForm && (
            <span>
              <Button onClick={() => props.launchForm()} kind="ghost">
                <>
                  {t('record', 'Record')} {props.displayText.toLowerCase()}
                </>
              </Button>
            </span>
          )}
        </p>
      </Tile>
    </Layer>
  );
};
