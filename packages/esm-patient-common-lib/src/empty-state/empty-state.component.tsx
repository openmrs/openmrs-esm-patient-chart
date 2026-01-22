import React from 'react';
import { Button, Layer, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './empty-state.scss';

export interface EmptyStateProps {
  displayText: string;
  headerTitle: string;
  launchForm?(): void;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const EmptyState: React.FC<EmptyStateProps> = (props) => {
  const { t } = useTranslation('@openmrs/esm-patient-chart-app');
  const isTablet = useLayoutType() === 'tablet';
  const HeadingTag = props.headingLevel || 'h4';

  return (
    <Layer className={styles.layer}>
      <Tile className={styles.tile}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <HeadingTag>{props.headerTitle}</HeadingTag>
        </div>
        <EmptyDataIllustration />
        <p className={styles.content}>
          {t('emptyStateText', 'There are no {{displayText}} to display for this patient', {
            displayText: props.displayText,
          })}
        </p>
        <p className={styles.action}>
          {props.launchForm && (
            <Button onClick={() => props.launchForm()} kind="ghost" size={isTablet ? 'lg' : 'sm'}>
              {t('record', 'Record')} {t(props.displayText)}
            </Button>
          )}
        </p>
      </Tile>
    </Layer>
  );
};
