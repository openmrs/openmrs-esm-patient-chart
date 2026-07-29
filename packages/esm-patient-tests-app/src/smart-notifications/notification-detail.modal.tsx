import React, { useCallback } from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { age, getPatientName, navigate, PatientPhoto, useSession } from '@openmrs/esm-framework';
import { dashboardMeta } from '../test-results/dashboard.meta';
import { interpretationLabel, type SmartNotification } from './notification-model';
import { getPreferredIdentifier } from './patient-display';
import { markNotificationReviewed } from './review-store';
import { formatRelativeTime } from './relative-time';
import PriorityTag from './notification-tag.component';
import styles from './notification-detail.scss';

interface NotificationDetailModalProps {
  closeModal: () => void;
  notification: SmartNotification;
  patient: fhir.Patient;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({ closeModal, notification, patient }) => {
  const { t } = useTranslation();
  const session = useSession();
  const relativeTime = formatRelativeTime(notification.resultDate, t);
  const identifier = getPreferredIdentifier(patient);
  const patientName = patient ? getPatientName(patient) : '';

  const handleMarkAsReviewed = useCallback(() => {
    const providerDisplay = session?.user?.person?.display ?? session?.user?.display ?? '';
    markNotificationReviewed(notification.id, notification.patientUuid, providerDisplay);
    closeModal();
  }, [closeModal, notification.id, notification.patientUuid, session]);

  // Deliberately does not clear the notification: the clinician is looking, not signing off.
  const handleViewInChart = useCallback(() => {
    navigate({ to: `\${openmrsSpaBase}/patient/${notification.patientUuid}/chart/${dashboardMeta.path}` });
    closeModal();
  }, [closeModal, notification.patientUuid]);

  return (
    <>
      <ModalHeader className={styles.modalHeader} closeModal={closeModal}>
        <div className={styles.headerContent}>
          <PriorityTag tag={notification.tag} />
          <span className={styles.headerMeta}>
            {t('labResultAtTime', 'Lab result · {{time}}', { time: relativeTime })}
          </span>
        </div>
      </ModalHeader>
      <ModalBody className={styles.modalBody}>
        <div className={styles.patientRow}>
          <span className={styles.modalAvatar}>
            <PatientPhoto patientName={patientName} patientUuid={notification.patientUuid} />
          </span>
          <div>
            <p className={styles.patientName}>{patientName}</p>
            <p className={styles.patientMeta}>
              {[
                patient?.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : null,
                patient?.birthDate ? age(patient.birthDate) : null,
                identifier?.value ? `${identifier.label} ${identifier.value}`.trim() : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        <dl className={styles.detailGrid}>
          <div className={styles.detailCell}>
            <dt className={styles.detailLabel}>{t('test', 'Test')}</dt>
            <dd className={styles.detailValue}>{notification.testLabel}</dd>
            {notification.panelLabel && <dd className={styles.detailSubValue}>{notification.panelLabel}</dd>}
          </div>
          <div className={styles.detailCell}>
            <dt className={styles.detailLabel}>{t('result', 'Result')}</dt>
            <dd className={styles.resultValue}>
              {notification.value ?? '--'}
              {notification.units && <span className={styles.resultUnits}>{notification.units}</span>}
            </dd>
            <dd className={styles.detailSubValue}>
              {notification.rejectionReason ??
                t('interpretationAndRange', '{{interpretation}} · Ref {{range}}', {
                  interpretation: interpretationLabel(notification.interpretation, t),
                  range: notification.referenceRangeText,
                })}
            </dd>
          </div>
          <div className={styles.detailCell}>
            <dt className={styles.detailLabel}>{t('orderingClinician', 'Ordering clinician')}</dt>
            <dd className={styles.detailValue}>{notification.ordererDisplay ?? '--'}</dd>
          </div>
          <div className={styles.detailCell}>
            <dt className={styles.detailLabel}>{t('location', 'Location')}</dt>
            <dd className={styles.detailValue}>{notification.locationDisplay ?? '--'}</dd>
            <dd className={styles.detailSubValue}>
              {t('orderNumberValue', 'Order number {{orderNumber}}', { orderNumber: notification.orderNumber ?? '--' })}
            </dd>
          </div>
        </dl>
      </ModalBody>
      <ModalFooter className={styles.modalFooter}>
        <Button kind="secondary" onClick={handleMarkAsReviewed} size="xl">
          {t('markAsReviewed', 'Mark as reviewed')}
        </Button>
        <Button kind="primary" onClick={handleViewInChart} size="xl">
          {t('viewInChart', 'View in chart')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default NotificationDetailModal;
