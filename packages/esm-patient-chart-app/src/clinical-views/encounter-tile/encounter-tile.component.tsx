import React, { memo } from 'react';
import { useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { CodeSnippetSkeleton, Tile, Layer, Grid, Column } from '@carbon/react';
import { useLastEncounter } from '../hooks';
import type { EncounterTileColumn, EncounterTileProps } from '../types';
import styles from './tile.scss';

export const EncounterTile = memo(({ patientUuid, columns, headerTitle }: EncounterTileProps) => {
  const isTablet = useLayoutType() === 'tablet';
  const columnSpan = Math.floor(16 / columns.length);

  return (
    <Layer className={styles.layer}>
      <Tile className={styles.tile}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4 className={styles.title}>{headerTitle}</h4>
        </div>
        <Grid fullWidth>
          {columns.map((column, index) => {
            return (
              <Column
                key={`${column.encounterTypeUuid}-${column.title}-${index}`}
                sm={columnSpan}
                md={columnSpan}
                lg={columnSpan}
              >
                <EncounterData patientUuid={patientUuid} column={column} />
              </Column>
            );
          })}
        </Grid>
      </Tile>
    </Layer>
  );
});

const EncounterData: React.FC<{
  patientUuid: string;
  column: EncounterTileColumn;
}> = ({ patientUuid, column }) => {
  const { t } = useTranslation();
  const { lastEncounter, isLoading, error, isValidating } = useLastEncounter(patientUuid, column.encounterTypeUuid);
  const obsValue = column.getObsValue(lastEncounter);
  const summaryValue =
    column.hasSummary === true && column.getSummaryObsValue && typeof column.getSummaryObsValue === 'function'
      ? column.getSummaryObsValue(lastEncounter)
      : null;

  if (isLoading || isValidating) {
    return <CodeSnippetSkeleton type="multi" className="skeleton" />;
  }

  if (error || lastEncounter === undefined) {
    return (
      <>
        <span className={styles.tileTitle}>{t(column.title)}</span>
        <span className={styles.tileValue}>{error?.message}</span>
      </>
    );
  }

  return (
    <>
      <span className={styles.tileTitle}>{t(column.header)}</span>
      {!(obsValue === '--' && summaryValue !== '--' && summaryValue !== null) && (
        <span className={styles.tileValue}>
          <p>{obsValue}</p>
        </span>
      )}

      {summaryValue !== null && summaryValue !== '--' && (
        <span className={styles.tileValue}>
          <p>{summaryValue}</p>
        </span>
      )}
    </>
  );
};
