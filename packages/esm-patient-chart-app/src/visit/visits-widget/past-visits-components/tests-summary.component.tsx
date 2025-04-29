import React from 'react';
import { type Encounter, ExtensionSlot } from '@openmrs/esm-framework';
import { type ExternalOverviewProps } from '@openmrs/esm-patient-common-lib';

const TestsSummary = ({ patientUuid, encounters }: { patientUuid: string; encounters: Array<Encounter> }) => {
  const filter = React.useMemo<ExternalOverviewProps['filter']>(() => {
    const encounterIds = encounters.map((e) => `Encounter/${e.uuid}`);
    return ([entry]) => {
      return encounterIds.includes(entry.encounter?.reference);
    };
  }, [encounters]);

  return <ExtensionSlot name="test-results-filtered-overview-slot" state={{ filter, patientUuid }} />;
};

export default TestsSummary;
