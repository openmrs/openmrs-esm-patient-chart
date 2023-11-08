import React, { useState, useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './overflow-menu.scss';

interface CustomOverflowMenuComponentProps {
  menuTitle: React.ReactNode;
  dropDownMenu: boolean;
  children: React.ReactNode;
  deceased?: boolean;
}

const CustomOverflowMenuComponent: React.FC<CustomOverflowMenuComponentProps> = ({
  dropDownMenu,
  menuTitle,
  children,
  deceased,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isTablet = useLayoutType() === 'tablet';
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!dropDownMenu) {
      setShowMenu((state) => state);
    }

    setShowMenu(() => false);
  }, [dropDownMenu]);
  const toggleShowMenu = useCallback(() => setShowMenu((state) => !state), []);

  useEffect(() => {
    /**
     * Toggle showMenu if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div data-overflow-menu className={classNames('cds--overflow-menu', styles.container)} ref={wrapperRef}>
      <button
        className={classNames(
          'cds--btn',
          'cds--btn--ghost',
          'cds--overflow-menu__trigger',
          { 'cds--overflow-menu--open': showMenu },
          { [styles.deceased]: deceased },
          styles.overflowMenuButton,
        )}
        aria-haspopup="true"
        aria-expanded={showMenu}
        id="custom-actions-overflow-menu-trigger"
        aria-controls="custom-actions-overflow-menu"
        onClick={toggleShowMenu}
      >
        {menuTitle}
      </button>
      <div
        className={classNames('cds--overflow-menu-options', 'cds--overflow-menu--flip', styles.menu, {
          [styles.show]: showMenu,
        })}
        tabIndex={0}
        data-floating-menu-direction="bottom"
        role="menu"
        aria-labelledby="custom-actions-overflow-menu-trigger"
        id="custom-actions-overflow-menu"
      >
        <ul
          className={classNames('cds--overflow-menu-options__content', { 'cds--overflow-menu-options--lg': isTablet })}
        >
          {children}
        </ul>
        <span />
      </div>
    </div>
  );
};

export default CustomOverflowMenuComponent;
