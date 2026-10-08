import React, { useCallback, useEffect } from 'react';
import { HeaderGlobalAction } from '@carbon/react';
import { Notification, NotificationNew } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useConfig, useSession } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { notificationsPanelName } from './constants';
import { setOptInUser } from './opt-in-store';
import { setNotificationsPanelClose } from './panel-controls';
import { setReadUser } from './read-store';
import { setReviewUser } from './review-store';
import { useSmartNotifications } from './smart-notifications.resource';
import { useChartPatient } from './use-chart-patient';
import styles from './notification-bell.scss';

/**
 * Props the app shell's `notifications-menu-button-slot` supplies. It hands over a subset of what
 * `top-nav-actions-slot` gets — there is no `hidePanel` here.
 */
export interface NotificationBellProps {
  isActivePanel(panelName: string): boolean;
  togglePanel(panelName: string): void;
  patientUuid: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ isActivePanel, togglePanel, patientUuid }) => {
  const { t } = useTranslation();
  const session = useSession();
  const { unreadCount } = useSmartNotifications(patientUuid);

  const userUuid = session?.user?.uuid;
  const isPanelOpen = isActivePanel?.(notificationsPanelName) ?? false;

  // Review, read and opt-in state are all per-user; point the stores at whoever is signed in before
  // reading them.
  useEffect(() => {
    if (userUuid) {
      setReviewUser(userUuid);
      setReadUser(userUuid);
      setOptInUser(userUuid);
    }
  }, [userUuid]);

  const closePanel = useCallback(() => {
    if (isActivePanel?.(notificationsPanelName)) {
      togglePanel?.(notificationsPanelName);
    }
  }, [isActivePanel, togglePanel]);

  // The rows live in a different slot and are never handed togglePanel, so publish the way back out
  // for them. See panel-controls.
  useEffect(() => {
    setNotificationsPanelClose(isPanelOpen ? closePanel : null);
    return () => setNotificationsPanelClose(null);
  }, [closePanel, isPanelOpen]);

  useEffect(() => {
    if (!isPanelOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closePanel, isPanelOpen]);

  const BellIcon = unreadCount > 0 ? NotificationNew : Notification;

  return (
    <HeaderGlobalAction
      aria-label={t('notifications', 'Notifications')}
      className={styles.bellButton}
      isActive={isPanelOpen}
      onClick={() => togglePanel?.(notificationsPanelName)}
      tooltipAlignment="end"
    >
      <BellIcon size={20} />
      {unreadCount > 0 && (
        <span aria-hidden="true" className={styles.bellBadge}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </HeaderGlobalAction>
  );
};

/**
 * Gates the bell on config and on there being an open chart. The notifications are patient-scoped
 * (see the feature's V1 limitations), so outside a chart there is nothing to count and the bell
 * would be dead weight in the header.
 */
const NotificationBellGate: React.FC<Omit<NotificationBellProps, 'patientUuid'>> = (props) => {
  const { smartNotifications } = useConfig<ConfigObject>();
  const { patientUuid } = useChartPatient();

  if (!smartNotifications?.enabled || !patientUuid) {
    return null;
  }

  return <NotificationBell {...props} patientUuid={patientUuid} />;
};

export default NotificationBellGate;
