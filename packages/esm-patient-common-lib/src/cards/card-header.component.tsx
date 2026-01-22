import React from 'react';
import classNames from 'classnames';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './card-header.scss';

interface CardHeaderProps {
  title: string;
  children: React.ReactNode;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardHeader({ title, children, headingLevel = 'h4' }: CardHeaderProps) {
  const isTablet = useLayoutType() === 'tablet';
  const HeadingTag = headingLevel;

  return (
    <div className={classNames(isTablet ? styles.tabletHeader : styles.desktopHeader)}>
      <HeadingTag>{title}</HeadingTag>
      {children}
    </div>
  );
}
