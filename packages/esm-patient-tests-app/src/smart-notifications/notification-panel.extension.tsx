import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Button, SkeletonText } from '@carbon/react';
import {
  ChevronRightIcon,
  CloseIcon,
  getPatientName,
  PatientPhoto,
  showModal,
  useConfig,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type ConfigObject } from '../config-schema';
import { interpretationLabel, type SmartNotification } from './notification-model';
import { smartNotificationDetailModalName } from './constants';
import { useCloseNotificationsPanel } from './panel-controls';
import { markNotificationRead, useReadNotifications } from './read-store';
import { useSmartNotifications } from './smart-notifications.resource';
import { useChartPatient } from './use-chart-patient';
import PriorityTag from './notification-tag.component';
import RelativeTime from './relative-time.component';
import styles from './notification-panel.scss';

interface NotificationRowsProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const NotificationRows: React.FC<NotificationRowsProps> = ({ patient, patientUuid }) => {
  /* Key used by interpretationLabel in notification-model.ts, which the i18next parser does not scan.
   * t('noInterpretation', 'No interpretation')
   */
  const { t } = useTranslation();
  const { error, isLoading, notifications } = useSmartNotifications(patientUuid);
  const read = useReadNotifications();
  const closePanel = useCloseNotificationsPanel();

  // Every notification here belongs to the open chart, because the resource fetches orders and
  // observations for one patient uuid. Identity is therefore taken wholly from `patient` — name and
  // photo from the same source — rather than half from the notification, which would silently pair
  // one patient's photo with another's name the day a cross-patient inbox lands (a V2 follow-up).
  const patientName = patient ? getPatientName(patient) : '';

  const handleOpenDetail = useCallback(
    (notification: SmartNotification) => {
      // Opening the detail is what "reading" means, so the badge drops as soon as the dialog opens.
      markNotificationRead(notification.id);
      const dispose = showModal(smartNotificationDetailModalName, {
        closeModal: () => dispose(),
        notification,
        patient,
      });
    },
    [patient],
  );

  return (
    <div className={styles.rows}>
      <div className={styles.header}>
        <p className={styles.subtitle}>
          {t('notificationsNeedReview', '{{count}} notifications need review', { count: notifications.length })}
        </p>
        {/* The shell's panel has no close affordance of its own yet, so we keep ours. */}
        {closePanel && (
          <Button
            className={styles.closeButton}
            hasIconOnly
            iconDescription={t('closeNotifications', 'Close notifications')}
            kind="ghost"
            onClick={closePanel}
            renderIcon={CloseIcon}
            size="sm"
          />
        )}
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <SkeletonText paragraph lineCount={3} />
        </div>
      ) : error ? (
        <p className={styles.error}>{t('errorLoadingNotifications', "Couldn't load notifications.")}</p>
      ) : notifications.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateTitle}>{t('noNotifications', 'Nothing needs your attention')}</p>
          <p className={styles.emptyStateBody}>
            {t(
              'noNotificationsBody',
              'Results that need action show up here. Routine, in-range results are filed straight to the chart.',
            )}
          </p>
        </div>
      ) : (
        <>
          <h3 className={styles.sectionLabel}>{t('requiresAttention', 'Requires attention')}</h3>
          <ul className={styles.list}>
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  className={classNames(styles.row, { [styles.rowUnread]: !read[notification.id] })}
                  onClick={() => handleOpenDetail(notification)}
                  type="button"
                >
                  <span className={styles.avatar}>
                    <PatientPhoto patientName={patientName} patientUuid={patient?.id} />
                  </span>
                  <span className={styles.rowBody}>
                    <span className={styles.rowMeta}>
                      <PriorityTag tag={notification.tag} />
                      <span className={styles.rowKind}>{t('labResult', 'Lab result')}</span>
                      <RelativeTime className={styles.rowTime} date={notification.resultDate} />
                    </span>
                    <span className={styles.rowPatient}>{patientName}</span>
                    <span className={styles.rowTest}>
                      {notification.value
                        ? t('testAndValue', '{{test}} — {{value}}', {
                            test: notification.testLabel,
                            value: [notification.value, notification.units].filter(Boolean).join(' '),
                            // Units and concept names contain characters i18next escapes by default,
                            // which React then renders literally as "U&#x2F;L". React escapes on
                            // render anyway, so this only avoids double-escaping.
                            interpolation: { escapeValue: false },
                          })
                        : notification.testLabel}
                    </span>
                    <span className={styles.rowRange}>
                      {notification.rejectionReason ??
                        t('interpretationAndRange', '{{interpretation}} · Ref {{range}}', {
                          interpretation: interpretationLabel(notification.interpretation, t),
                          range: notification.referenceRangeText,
                          interpolation: { escapeValue: false },
                        })}
                    </span>
                  </span>
                  <ChevronRightIcon aria-hidden="true" className={styles.chevron} size={16} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className={styles.footer}>
        <p>
          <strong>{t('smartFiltering', 'Smart filtering:')}</strong>{' '}
          {t(
            'smartFilteringExplainer',
            'only STAT orders and critical values interrupt you. Routine, normal & expected-abnormal results are filed silently.',
          )}
        </p>
      </div>
    </div>
  );
};

/**
 * Renders the inbox rows into the app shell's own notifications panel
 * (`notifications-nav-menu-slot`). The shell owns the panel chrome — the HeaderPanel, its geometry,
 * the "Notifications" heading and mutual exclusion with the other header panels — so this renders
 * content only.
 *
 * Gated the same way as the bell: notifications are patient-scoped, so with no chart open there is
 * nothing to list.
 */
const NotificationRowsGate: React.FC = () => {
  const { smartNotifications } = useConfig<ConfigObject>();
  const { patient, patientUuid } = useChartPatient();

  if (!smartNotifications?.enabled || !patientUuid) {
    return null;
  }

  return <NotificationRows patient={patient} patientUuid={patientUuid} />;
};

export default NotificationRowsGate;
