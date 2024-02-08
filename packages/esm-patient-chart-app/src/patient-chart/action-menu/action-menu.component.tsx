import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './action-menu.scss';

interface ActionMenuInterface {
  open: boolean;
}

export const ActionMenu: React.FC<ActionMenuInterface> = ({ open }) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const initialHeight = useRef(window.innerHeight);

  useEffect(() => {
    const handleKeyboardVisibilityChange = () => {
      setKeyboardVisible(initialHeight.current > window.innerHeight);
      if (initialHeight.current != window.innerHeight) {
        initialHeight.current = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleKeyboardVisibilityChange);
    return () => window.removeEventListener('resize', handleKeyboardVisibilityChange);
  }, [initialHeight]);

  return (
    <aside
      className={classNames(styles.sideRail, {
        [styles.hiddenSideRail]: keyboardVisible,
        [styles.showSideRail]: !keyboardVisible,
      })}
    >
      <div className={styles.container}>
        <ExtensionSlot className={styles.chartExtensions} name={'action-menu-chart-items-slot'} />
      </div>
    </aside>
  );
};

export default ActionMenu;
