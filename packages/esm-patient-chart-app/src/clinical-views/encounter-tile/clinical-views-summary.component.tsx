import React, { memo, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { getEncounterTileColumns } from '../utils';
import { EncounterTile } from './encounter-tile.component';
import { type MenuCardProps } from '../types';

interface OverviewListProps {
  patientUuid: string;
}

const ClinicalViewsSummary: React.FC<OverviewListProps> = memo(({ patientUuid }) => {
  const { tileDefinitions, trueConceptUuid, falseConceptUuid, otherConceptUuid } = useConfig();

  const { t } = useTranslation();

  const tilesData = useMemo(() => {
    const configConcepts = {
      trueConceptUuid,
      falseConceptUuid,
      otherConceptUuid,
    };

    return tileDefinitions?.map((tile: MenuCardProps) => ({
      title: t(tile.tileHeader),
      columns: getEncounterTileColumns(tile, configConcepts),
    }));
  }, [tileDefinitions, t, trueConceptUuid, falseConceptUuid, otherConceptUuid]);

  return tilesData?.length > 0 ? (
    <>
      {tilesData.map((tile, index) => (
        <EncounterTile key={index} patientUuid={patientUuid} columns={tile.columns} headerTitle={tile.title} />
      ))}
    </>
  ) : null;
});

export default ClinicalViewsSummary;
