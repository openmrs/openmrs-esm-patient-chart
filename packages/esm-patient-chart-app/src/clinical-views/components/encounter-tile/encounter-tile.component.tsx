import React, { useMemo } from 'react';
import { useLayoutType } from '@openmrs/esm-framework';
import { CodeSnippetSkeleton, Tile, Column, Layer } from '@carbon/react';
import styles from './tile.scss';
import { groupColumnsByEncounterType } from '../../utils/helpers';
import { useLastEncounter } from '../../hooks/useLastEncounter';
import { LazyCell } from '../../../lazy-cell/lazy-cell.component';
import { useTranslation } from 'react-i18next';

export interface EncounterTileColumn {
  key: string;
  header: string;
  encounterUuid: string;
  concept: string;
  title?: string;
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

export const EncounterTile = React.memo(({ patientUuid, columns, headerTitle }: EncounterTileProps) => {
  const columnsByEncounterType = useMemo(() => groupColumnsByEncounterType(columns), [columns]);
  const isTablet = useLayoutType() === 'tablet';

  return (
    <Layer className={styles.layer}>
      <Tile className={styles.tile}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4 className={styles.title}>{headerTitle}</h4>
        </div>
        <Column className={styles.columnContainer}>
          {Object.entries(columnsByEncounterType).map(([encounterUuid, columns]) => (
            <EncounterData
              key={encounterUuid}
              patientUuid={patientUuid}
              encounterType={encounterUuid}
              columns={columns}
            />
          ))}
        </Column>
      </Tile>
    </Layer>
  );
});

const EncounterData: React.FC<{
  patientUuid: string;
  encounterType: string;
  columns: EncounterTileColumn[];
}> = ({ patientUuid, encounterType, columns }) => {
  const { lastEncounter, isLoading, error, isValidating } = useLastEncounter(patientUuid, encounterType);
  const { t } = useTranslation();

  if (isLoading || isValidating) {
    return <CodeSnippetSkeleton type="multi" role="progressbar" />;
  }

  if (error || lastEncounter == undefined) {
    return (
      <div className={styles.tileBox}>
        {columns.map((column, ind) => (
          <div key={ind}>
            <span className={styles.tileTitle}>{t(column.title)}</span>
            <span className={styles.tileValue}>{error?.message}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.tileBox}>
      {columns.map((column, ind) => (
        <div key={ind}>
          <span className={styles.tileTitle}>{column.header}</span>
          <span className={styles.tileValue}>
            <LazyCell lazyValue={column.getObsValue(lastEncounter)} />
          </span>
          {column.hasSummary && (
            <>
              <span className={styles.tileValue}>
                <LazyCell lazyValue={column.getSummaryObsValue(lastEncounter)} />
              </span>
              <span className={styles.tileValue}>
                <LazyCell lazyValue={column.getObsValue(lastEncounter)} />
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
