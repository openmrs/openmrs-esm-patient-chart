import React, { useCallback, useEffect, useState } from 'react';
import { HeaderGlobalAction } from '@carbon/react';
import { Notification, NotificationNew } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useConfig, useOnClickOutside, useSession } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { setReviewUser } from './review-store';
import { useSmartNotifications } from './smart-notifications.resource';
import { useChartPatient } from './use-chart-patient';
import NotificationPanel from './notification-panel.component';
import styles from './notification-bell.scss';

interface NotificationBellProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ patient, patientUuid }) => {
  const { t } = useTranslation();
  const [showPanel, setShowPanel] = useState(false);
  const session = useSession();
  const { error, isLoading, notifications, unreadCount } = useSmartNotifications(patientUuid);

  const userUuid = session?.user?.uuid;

  // Review state is per-user; point the store at whoever is signed in before reading it.
  useEffect(() => {
    if (userUuid) {
      setReviewUser(userUuid);
    }
  }, [userUuid]);

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    // The detail modal is rendered outside this subtree, so a click in it would otherwise read as
    // "outside" and dismiss the panel behind it.
    if ((event.target as HTMLElement | null)?.closest('[role="dialog"]')) {
      return;
    }
    setShowPanel(false);
  }, []);

  const containerRef = useOnClickOutside<HTMLDivElement>(handleOutsideClick, showPanel);

  const handleClose = useCallback(() => setShowPanel(false), []);
  const handleToggle = useCallback(() => setShowPanel((previous) => !previous), []);

  useEffect(() => {
    if (!showPanel) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPanel(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPanel]);

  const BellIcon = unreadCount > 0 ? NotificationNew : Notification;

  return (
    <div className={styles.bellContainer} ref={containerRef}>
      <HeaderGlobalAction
        aria-label={t('notifications', 'Notifications')}
        className={styles.bellButton}
        isActive={showPanel}
        onClick={handleToggle}
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <span aria-hidden="true" className={styles.bellBadge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </HeaderGlobalAction>
      {showPanel && (
        <NotificationPanel
          error={error}
          isLoading={isLoading}
          notifications={notifications}
          onClose={handleClose}
          patient={patient}
        />
      )}
    </div>
  );
};

/**
 * Gates the bell on config and on there being an open chart. The notifications are patient-scoped
 * (see the feature's V1 limitations), so outside a chart there is nothing to count and the bell
 * would be dead weight in the header.
 */
const NotificationBellGate: React.FC = () => {
  const { smartNotifications } = useConfig<ConfigObject>();
  const { patient, patientUuid } = useChartPatient();

  if (!smartNotifications?.enabled || !patientUuid) {
    return null;
  }

  return <NotificationBell patient={patient} patientUuid={patientUuid} />;
};

export default NotificationBellGate;
