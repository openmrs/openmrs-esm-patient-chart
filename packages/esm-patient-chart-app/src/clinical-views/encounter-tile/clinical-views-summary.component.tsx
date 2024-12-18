import React, { memo, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { type ConfigObject, useConfig } from '@openmrs/esm-framework';
import { getEncounterTileColumns } from '../utils';
import { EncounterTile } from './encounter-tile.component';
import { type MenuCardProps } from '../types';

interface OverviewListProps {
  patientUuid: string;
}

const ClinicalViewsSummary: React.FC<OverviewListProps> = memo(({ patientUuid }) => {
  const config = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const tileDefinitions = config.tilesDefinitions;

  const tilesData = useMemo(() => {
    const configConcepts = {
      trueConceptUuid: config.trueConceptUuid,
      falseConceptUuid: config.falseConceptUuid,
      otherConceptUuid: config.otherConceptUuid,
    };

    return tileDefinitions?.map((tile: MenuCardProps) => ({
      title: t(tile.tileHeader),
      columns: getEncounterTileColumns(tile, configConcepts),
    }));
  }, [tileDefinitions, t, config.trueConceptUuid, config.falseConceptUuid, config.otherConceptUuid]);

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
