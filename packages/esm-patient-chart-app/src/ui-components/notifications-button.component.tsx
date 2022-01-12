import React from 'react';
import styles from './action-menu.component.scss';
import Notification20 from '@carbon/icons-react/es/notification/20';
import { Button } from 'carbon-components-react';

interface NotificationsButtonInterface {
  onClick: () => void;
}

const NotificationsButton: React.FC<NotificationsButtonInterface> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      iconDescription="Notifications"
      className={styles.iconButton}
      kind="ghost"
      hasIconOnly
      tooltipPosition="bottom"
      tooltipAlignment="end"
    >
      <Notification20 aria-label="Notifications" />
    </Button>
  );
};

export default NotificationsButton;
