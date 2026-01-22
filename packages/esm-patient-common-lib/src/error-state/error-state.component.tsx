import React from 'react';
import { Layer, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './error-state.scss';

export interface ErrorStateProps {
  error: any;
  headerTitle: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, headerTitle, headingLevel = 'h4' }) => {
  const { t } = useTranslation('@openmrs/esm-patient-chart-app');
  const isTablet = useLayoutType() === 'tablet';
  const HeadingTag = headingLevel;

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <HeadingTag>{headerTitle}</HeadingTag>
        </div>
        <p className={styles.errorMessage}>
          {t('error', 'Error')} {`${error?.response?.status}: `}
          {error?.response?.statusText}
        </p>
        <p className={styles.errorCopy}>
          {t(
            'errorCopy',
            'Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above.',
          )}
        </p>
      </Tile>
    </Layer>
  );
};
