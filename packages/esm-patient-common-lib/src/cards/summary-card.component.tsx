/** @module @category UI */
import React, { useMemo } from 'react';
import { Tile, Column } from '@carbon/react';
import styles from './summary-card.scss';

export interface SummaryCardProps {
  columns: Array<SummaryCardColumn>;
  headerTitle: string;
  maxRowItems?: number;
}

export interface SummaryCardColumn {
  header: string;
  value: string;
  summary?: string;
}

export const SummaryCard = ({ columns, headerTitle, maxRowItems }: SummaryCardProps) => {
  const groupedColumns = useMemo(() => {
    if (maxRowItems && columns.length > maxRowItems) {
      let groups: SummaryCardColumn[][] = [];
      for (let i = 0; i < columns.length; i += maxRowItems) {
        groups.push(columns.slice(i, i + maxRowItems));
      }
      return groups;
    }
    return [columns];
  }, [columns, maxRowItems]);

  return (
    <Tile className={styles.tile}>
      <div className={styles.cardTitle}>
        <h4 className={styles.title}> {headerTitle} </h4>
      </div>
      {maxRowItems ? (
        groupedColumns.map((group) => (
          <Column className={styles.columnContainer}>
            {group.map((column, index) => (
              <SummaryItem column={column} key={index} />
            ))}
          </Column>
        ))
      ) : (
        <Column className={styles.columnContainer}>
          {columns.map((column, index) => (
            <SummaryItem column={column} key={index} />
          ))}
        </Column>
      )}
    </Tile>
  );
};

function SummaryItem({ column }: { column: SummaryCardColumn }) {
  return (
    <div className={styles.tileBox}>
      <div className={styles.tileBoxColumn}>
        <span className={styles.tileTitle}> {column.header} </span>
        <span className={styles.tileValue}>{column.value}</span>
        {column.summary && <span className={styles.tileSummary}>{column.summary}</span>}
      </div>
    </div>
  );
}
