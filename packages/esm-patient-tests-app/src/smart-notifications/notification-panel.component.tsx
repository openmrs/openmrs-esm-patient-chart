import React, { useCallback, useEffect, useRef } from 'react';
import { Button, SkeletonText } from '@carbon/react';
import { ChevronRightIcon, CloseIcon, getPatientName, showModal } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type SmartNotification } from './notification-model';
import { smartNotificationDetailModalName } from './constants';
import { getInitials } from './patient-display';
import PriorityTag from './notification-tag.component';
import RelativeTime from './relative-time.component';
import styles from './notification-panel.scss';

interface NotificationPanelProps {
  error: Error | undefined;
  isLoading: boolean;
  notifications: Array<SmartNotification>;
  onClose: () => void;
  patient: fhir.Patient;
}

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const NotificationPanel: React.FC<NotificationPanelProps> = ({ error, isLoading, notifications, onClose, patient }) => {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLElement>(null);
  const initials = getInitials(patient);
  const patientName = patient ? getPatientName(patient) : '';

  // Move focus into the panel on open, and keep Tab inside it while it is open, so the inbox
  // behaves like the dialog it is announced as.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    // Focus the panel itself rather than its first control, so a screen reader announces the
    // dialog and its heading before anything else, and no tooltip pops open on arrival.
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
      const dispose = showModal(smartNotificationDetailModalName, {
        closeModal: () => dispose(),
        notification,
        patient,
      });
    },
    [patient],
  );

  return (
    <aside
      aria-label={t('notifications', 'Notifications')}
      className={styles.panel}
      ref={panelRef}
      role="dialog"
      tabIndex={-1}
    >
      <header className={styles.header}>
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
      </header>

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
                  <button className={styles.row} onClick={() => handleOpenDetail(notification)} type="button">
                    <span aria-hidden="true" className={styles.avatar}>
                      {initials}
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
                            interpretation: notification.interpretation
                              ? notification.interpretation.charAt(0) +
                                notification.interpretation.slice(1).toLowerCase().replace(/_/g, ' ')
                              : t('noInterpretation', 'No interpretation'),
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

      <footer className={styles.footer}>
        <p>
          <strong>{t('smartFiltering', 'Smart filtering:')}</strong>{' '}
          {t(
            'smartFilteringExplainer',
            'only STAT orders and critical values interrupt you. Routine, normal & expected-abnormal results are filed silently.',
          )}
        </p>
      </footer>
    </aside>
  );
};

export default NotificationPanel;
