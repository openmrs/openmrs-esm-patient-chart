import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button, HeaderPanel, SkeletonText } from '@carbon/react';
import { ChevronRightIcon, CloseIcon, getPatientName, PatientPhoto, showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { interpretationLabel, type SmartNotification } from './notification-model';
import { smartNotificationDetailModalName } from './constants';
import { markNotificationRead } from './read-store';
import PriorityTag from './notification-tag.component';
import RelativeTime from './relative-time.component';
import styles from './notification-panel.scss';

interface NotificationPanelProps {
  error: Error | undefined;
  isLoading: boolean;
  notifications: Array<SmartNotification>;
  onClose: () => void;
  patient: fhir.Patient;
  /** Notification id -> the time it was opened. Read rows stay listed but stop drawing attention. */
  read: Record<string, string>;
}

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  error,
  isLoading,
  notifications,
  onClose,
  patient,
  read,
}) => {
  /* Key used by interpretationLabel in notification-model.ts, which the i18next parser does not scan.
   * t('noInterpretation', 'No interpretation')
   */
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const patientName = patient ? getPatientName(patient) : '';

  // Move focus into the panel on open and keep Tab inside it, so the inbox behaves like the dialog
  // it is announced as. Carbon's HeaderPanel handles the geometry but not the focus contract.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    panel.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener('keydown', handleKeyDown);
    return () => panel.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // HeaderPanel spreads unknown props onto its <div>, but its prop types don't declare them, so the
  // dialog semantics go in through a spread rather than as literal attributes.
  const dialogProps = { role: 'dialog', tabIndex: -1 };

  return (
    <HeaderPanel
      aria-label={t('notifications', 'Notifications')}
      className={styles.panel}
      expanded
      ref={panelRef}
      {...dialogProps}
    >
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{t('notifications', 'Notifications')}</h2>
          <p className={styles.subtitle}>
            {t('notificationsNeedReview', '{{count}} notifications need review', { count: notifications.length })}
          </p>
        </div>
        <Button
          className={styles.closeButton}
          hasIconOnly
          iconDescription={t('closeNotifications', 'Close notifications')}
          kind="ghost"
          onClick={onClose}
          renderIcon={CloseIcon}
          size="sm"
        />
      </div>

      <div className={styles.body}>
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
                      <PatientPhoto patientName={patientName} patientUuid={notification.patientUuid} />
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
                            })
                          : notification.testLabel}
                      </span>
                      <span className={styles.rowRange}>
                        {notification.rejectionReason ??
                          t('interpretationAndRange', '{{interpretation}} · Ref {{range}}', {
                            interpretation: interpretationLabel(notification.interpretation, t),
                            range: notification.referenceRangeText,
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
      </div>

      <div className={styles.footer}>
        <p>
          <strong>{t('smartFiltering', 'Smart filtering:')}</strong>{' '}
          {t(
            'smartFilteringExplainer',
            'only STAT orders and critical values interrupt you. Routine, normal & expected-abnormal results are filed silently.',
          )}
        </p>
      </div>
    </HeaderPanel>
  );
};

export default NotificationPanel;
