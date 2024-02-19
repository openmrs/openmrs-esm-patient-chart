import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
import styles from './action-menu.scss';
import { useWorkspaces } from '@openmrs/esm-patient-common-lib';

interface ActionMenuInterface {}

export const ActionMenu: React.FC<ActionMenuInterface> = () => {
  const { active, workspaceWindowState } = useWorkspaces();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const initialHeight = useRef(window.innerHeight);
  const isTablet = useLayoutType() === 'tablet';
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

  if (active && workspaceWindowState !== 'hidden' && isTablet) {
    return null;
  }

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
