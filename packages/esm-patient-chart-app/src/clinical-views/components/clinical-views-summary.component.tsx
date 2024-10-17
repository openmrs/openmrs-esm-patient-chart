import React, { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { EncounterTile } from './encounter-tile/encounter-tile.component';
import { type ConfigObject, useConfig } from '@openmrs/esm-framework';
import { getEncounterTileColumns, type MenuCardProps } from '../utils/encounter-tile-config-builder';

interface OverviewListProps {
  patientUuid: string;
}

const ClinicalViewsSummary: React.FC<OverviewListProps> = ({ patientUuid }) => {
  const config = useConfig() as ConfigObject;
  const { t } = useTranslation();
  const tilesDefinitions = config.tilesDefinitions;

  const tilesData = useMemo(() => {
    return tilesDefinitions?.map((tile: MenuCardProps) => ({
      title: t(tile.tileHeader),
      columns: getEncounterTileColumns(tile, t),
    }));
  }, [tilesDefinitions, t]);

  return (
    <>
      {tilesData?.length > 0 &&
        tilesData?.map((tile, index) => (
          <EncounterTile key={index} patientUuid={patientUuid} columns={tile.columns} headerTitle={tile.title} />
        ))}
    </>
  );
};

export default ClinicalViewsSummary;
