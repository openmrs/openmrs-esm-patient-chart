import React, { useMemo } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { getEncounterTileColumns } from '../../encounter-tile/utils/encounter-tile-config-builder';
import {
  MemoizedEncounterTile,
  type EncounterTileColumn,
} from '../../encounter-tile/components/encounter-tile.component';

interface OverviewListProps {
  patientUuid: string;
}

interface TileDefinition {
  title: string;
  columns: Array<EncounterTileColumn>;
}

const ClinicalViewsSummary: React.FC<OverviewListProps> = ({ patientUuid }) => {
  const config = useConfig();
  const tilesDefinitions = config.tilesDefinitions;

  const tilesData = useMemo(
    () =>
      tilesDefinitions?.map((tile: any) => ({
        title: tile.tileHeader,
        columns: getEncounterTileColumns(tile),
      })),
    [tilesDefinitions],
  );

  return (
    <>
      {tilesData?.length > 0 &&
        tilesData?.map((tile, index) => (
          <MemoizedEncounterTile
            key={index}
            patientUuid={patientUuid}
            columns={tile.columns}
            headerTitle={tile.title}
          />
        ))}
    </>
  );
};

export default ClinicalViewsSummary;
