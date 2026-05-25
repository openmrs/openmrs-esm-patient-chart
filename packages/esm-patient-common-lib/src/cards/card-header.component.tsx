import React from 'react';
import classNames from 'classnames';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './card-header.scss';

interface CardHeaderProps {
  title: string;
  children: React.ReactNode;
}

/**
 * A standard card header used across all patient chart widgets.
 * Wrapping in React.memo prevents unnecessary re-renders when parent components
 * re-render but title and children remain the same.
 */
export const CardHeader = React.memo(function CardHeader({ title, children }: CardHeaderProps) {
  const isTablet = useLayoutType() === 'tablet';

  return (
    <div className={classNames(isTablet ? styles.tabletHeader : styles.desktopHeader)}>
      <h4>{title}</h4>
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';
