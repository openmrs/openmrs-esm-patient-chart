import React from 'react';
import { InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { useLatestReviewForPatient } from './review-store';
import { formatRelativeTime } from './relative-time';
import styles from './reviewed-banner.scss';

interface ReviewedBannerProps {
  patientUuid: string;
}

/**
 * Confirms, on the Results dashboard, that a notification was signed off — the other half of the
 * round trip that starts with "Mark as reviewed" or "View in chart" in the notification inbox.
 */
const ReviewedBanner: React.FC<ReviewedBannerProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { smartNotifications } = useConfig<ConfigObject>();
  const review = useLatestReviewForPatient(patientUuid);
  const relativeTime = formatRelativeTime(review?.reviewedAt, t);

  if (!smartNotifications?.enabled || !review) {
    return null;
  }

  return (
    <InlineNotification
      className={styles.banner}
      hideCloseButton
      kind="success"
      lowContrast
      subtitle={t('reviewedByAtTime', 'Reviewed by {{provider}} · {{time}}', {
        provider: review.providerDisplay,
        time: relativeTime,
        interpolation: { escapeValue: false },
      })}
      // Names the test so the banner reads as a receipt for one notification rather than a verdict
      // on the whole dashboard. Records written before the label was stored fall back to the
      // generic wording.
      title={
        review.testLabel
          ? t('testReviewed', '{{testLabel}} reviewed', {
              testLabel: review.testLabel,
              interpolation: { escapeValue: false },
            })
          : t('resultReviewed', 'Result reviewed')
      }
    />
  );
};

export default ReviewedBanner;
