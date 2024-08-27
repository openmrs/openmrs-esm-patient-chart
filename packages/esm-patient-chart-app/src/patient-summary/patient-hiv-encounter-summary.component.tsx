import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import serviceSummaryConfig from './service-summary-config.json';

import { EncounterTile, type EncounterTileColumn } from '../encounter-tile/encounter-tile.component';
import { getEncounterTileColumns } from '../encounter-list/encounter-tile-config-builder';

interface OverviewListProps {
  patientUuid: string;
}

interface TileDefinition {
  title: string;
  columns: Array<EncounterTileColumn>;
}

const HIVSummaryOverviewList: React.FC<OverviewListProps> = ({ patientUuid }) => {
  const config = useConfig();
  //console.log(config)

  const tilesDefinitions = serviceSummaryConfig['encounter-tiles-group'].tilesDefinitions;

  const tilesData: Array<TileDefinition> = tilesDefinitions.map((tile: any) => ({
    title: tile.title,
    columns: getEncounterTileColumns(tile, config),
  }));

  return (
    <>
      {tilesData.map((tile, index) => (
        <EncounterTile key={index} patientUuid={patientUuid} columns={tile.columns} headerTitle={tile.title} />
      ))}
    </>
  );
};

export default HIVSummaryOverviewList;
