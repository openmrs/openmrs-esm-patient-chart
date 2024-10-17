import { CodeSnippetSkeleton, Tile, Column } from '@carbon/react';
import React, { useMemo } from 'react';
import styles from './tile.scss';
import { groupColumnsByEncounterType } from '../../utils/helpers';
import { useLastEncounter } from '../../hooks/useLastEncounter';
import { LazyCell } from '../../../lazy-cell/lazy-cell.component';
import { useTranslation } from 'react-i18next';
import { type FormattedCardColumn } from '../../utils/encounter-tile-config-builder';

export interface EncounterTileColumn {
  key: string;
  header: string;
  encounterUuid: string;
  getObsValue: (encounter: any) => string | Promise<string>;
  getSummaryObsValue?: (encounter: any) => string | Promise<string>;
  encounter?: any;
  hasSummary?: Boolean;
}
export interface EncounterTileProps {
  patientUuid: string;
  columns: Array<EncounterTileColumn>;
  headerTitle: string;
}

export interface EncounterValuesTileProps {
  patientUuid: string;
  column: any;
}

const EncounterTileInternal: React.FC<EncounterTileProps> = ({ patientUuid, columns, headerTitle }) => {
  const columnsByEncounterType = useMemo(() => groupColumnsByEncounterType(columns), [columns]);

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <div className={styles.cardTitle}>
          <h4 className={styles.title}>{headerTitle}</h4>
        </div>
        <Column className={styles.columnContainer}>
          {Object.entries(columnsByEncounterType).map(([encounterType, columns]) => (
            <EncounterData
              key={encounterType}
              patientUuid={patientUuid}
              encounterType={encounterType}
              columns={columns as FormattedCardColumn[]}
            />
          ))}
        </Column>
      </Tile>
    </div>
  );
};

export const EncounterTile = React.memo(EncounterTileInternal);

const EncounterData: React.FC<{
  patientUuid: string;
  encounterType: string;
  columns: FormattedCardColumn[];
}> = ({ patientUuid, encounterType, columns }) => {
  const { lastEncounter, isLoading, error, isValidating } = useLastEncounter(patientUuid, encounterType);
  const { t } = useTranslation();

  if (isLoading || isValidating) {
    return <CodeSnippetSkeleton type="multi" data-testid="skeleton-text" />;
  }

  if (error || lastEncounter === undefined) {
    return (
      <div className={styles.tileBox}>
        {columns.map((column, ind) => (
          <div key={ind} className={styles.tileBoxColumn}>
            <span className={styles.tileTitle}>{t(column.title)}</span>
            <span className={styles.tileValue}>--</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.tileBox}>
      {columns.map((column, ind) => (
        <div key={ind} className={styles.tileBoxColumn}>
          <span className={styles.tileTitle}>{column.title}</span>
          <span className={styles.tileValue}>
            <LazyCell lazyValue={column.getObsValue(lastEncounter)} />
          </span>
          {column.hasSummary && (
            <span className={styles.tileTitle}>
              <LazyCell lazyValue={column.getSummaryObsValue(lastEncounter)} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
