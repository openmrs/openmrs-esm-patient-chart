import { Tile } from '@carbon/react';
import React from 'react';
import styles from './order-basket-search-results.scss';

interface DrugBrowseEmptyStateProps {
  title: string;
  description: string;
}

export function DrugBrowseEmptyState({ title, description }: DrugBrowseEmptyStateProps) {
  return (
    <Tile className={styles.emptyState}>
      <div>
        <h4 className={styles.productiveHeading01}>{title}</h4>
        <p className={styles.bodyShort01}>
          <span>{description}</span>
        </p>
      </div>
    </Tile>
  );
}
