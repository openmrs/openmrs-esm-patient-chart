import React from 'react';
import { Button, InlineNotification, Layer, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './network-error-state.scss';

export interface NetworkErrorStateProps {
  /** The header title shown above the error */
  headerTitle?: string;
  /** Callback fired when the user clicks "Try again" */
  onRetry?: () => void;
  /** Optional custom error message override */
  errorMessage?: string;
}

/**
 * Reusable error state component for network/data-fetch failures.
 * Shows a user-friendly message with a retry button so clinicians
 * can recover without a full page reload.
 */
export const NetworkErrorState: React.FC<NetworkErrorStateProps> = ({ headerTitle, onRetry, errorMessage }) => {
  const { t } = useTranslation('@openmrs/esm-patient-chart-app');

  const defaultMessage = t(
    'networkErrorMessage',
    'Unable to load {{section}} data. This may be a network issue. Please check your connection and try again.',
    { section: headerTitle ?? t('patient', 'patient') },
  );

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={styles.content}>
          <InlineNotification
            kind="error"
            title={headerTitle ? `${t('errorLoading', 'Error loading')} ${headerTitle}` : t('loadError', 'Load error')}
            subtitle={errorMessage ?? defaultMessage}
            hideCloseButton
            lowContrast
          />
          {onRetry && (
            <Button
              className={styles.retryButton}
              kind="tertiary"
              size="sm"
              onClick={onRetry}
            >
              {t('tryAgain', 'Try again')}
            </Button>
          )}
        </div>
      </Tile>
    </Layer>
  );
};
