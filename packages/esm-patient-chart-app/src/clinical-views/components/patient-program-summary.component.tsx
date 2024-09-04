import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { getEncounterTileColumns } from '../../encounter-tile/utils/encounter-tile-config-builder';
import { EncounterTile, type EncounterTileColumn } from '../../encounter-tile/components/encounter-tile.component';

interface OverviewListProps {
  patientUuid: string;
}

interface TileDefinition {
  title: string;
  columns: Array<EncounterTileColumn>;
}

const PatientSummaryOverviewList: React.FC<OverviewListProps> = ({ patientUuid }) => {
  const config = useConfig();

  const tilesDefinitions = config.tilesDefinitions;

  const tilesData: Array<TileDefinition> = tilesDefinitions.map((tile: any) => ({
    title: tile.tileHeader,
    columns: getEncounterTileColumns(tile),
  }));

  return (
    <>
      {tilesData.map((tile, index) => (
        <EncounterTile key={index} patientUuid={patientUuid} columns={tile.columns} headerTitle={tile.title} />
      ))}
    </>
  );
};

export default PatientSummaryOverviewList;
