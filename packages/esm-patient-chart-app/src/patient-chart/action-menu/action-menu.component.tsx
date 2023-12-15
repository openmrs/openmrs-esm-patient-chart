import React, { useEffect, useRef, useState } from 'react';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import styles from './action-menu.scss';

interface ActionMenuInterface {
  open: boolean;
}

export const ActionMenu: React.FC<ActionMenuInterface> = ({ open }) => {
  const layout = useLayoutType();
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
    <aside className={`${styles.sideRail} ${keyboardVisible ? styles.hiddenSideRail : styles.showSideRail}`}>
      <div className={styles.container}>
        <ExtensionSlot className={styles.chartExtensions} name={'action-menu-chart-items-slot'} />
        {layout === 'small-desktop' || layout === 'large-desktop' ? <div className={styles.divider}></div> : null}
        <ExtensionSlot className={styles.nonChartExtensions} name={'action-menu-non-chart-items-slot'} />
      </div>
    </aside>
  );
};

export default ActionMenu;
