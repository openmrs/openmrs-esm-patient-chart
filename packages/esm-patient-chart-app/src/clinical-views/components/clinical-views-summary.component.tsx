import React, { memo, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { EncounterTile } from './encounter-tile/encounter-tile.component';
import { type ConfigObject, useConfig } from '@openmrs/esm-framework';
import { getEncounterTileColumns, type MenuCardProps } from '../utils';

interface OverviewListProps {
  patientUuid: string;
}

const ClinicalViewsSummary: React.FC<OverviewListProps> = memo(({ patientUuid }) => {
  const config = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const tileDefinitions = config.tilesDefinitions;

  const tilesData = useMemo(() => {
    return tileDefinitions?.map((tile: MenuCardProps) => ({
      title: t(tile.tileHeader),
      columns: getEncounterTileColumns(tile, t),
    }));
  }, [tileDefinitions, t]);

  return (
    <>
      {tilesData?.length > 0 &&
        tilesData?.map((tile, index) => (
          <EncounterTile key={index} patientUuid={patientUuid} columns={tile.columns} headerTitle={tile.title} />
        ))}
    </>
  );
});

export default ClinicalViewsSummary;
