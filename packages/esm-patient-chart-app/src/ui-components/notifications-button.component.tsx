import React from 'react';
import Button from 'carbon-components-react/es/components/Button';
import Notification20 from '@carbon/icons-react/es/notification/20';
import styles from './action-menu.component.scss';

interface NotificationsButtonInterface {
  onClick: Function;
}

const NotificationsButton: React.FC<NotificationsButtonInterface> = ({ onClick }) => {
  return (
    <Button onClick={onClick} iconDescription="Notifications" className={styles.iconButton} kind="ghost" hasIconOnly>
      <Notification20 aria-label="Notifications" />
    </Button>
  );
};

export default NotificationsButton;
