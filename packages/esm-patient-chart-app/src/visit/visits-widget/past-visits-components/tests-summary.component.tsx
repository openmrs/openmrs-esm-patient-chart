import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { RecentOverviewProps } from '@openmrs/esm-patient-test-results-app';
import { Encounter } from '../visit.resource';

const TestsSummary = ({ patientUuid, encounters }: { patientUuid: string; encounters: Array<Encounter> }) => {
  const filter = React.useMemo<RecentOverviewProps['filter']>(() => {
    const encounterIds = encounters.map((e) => `Encounter/${e.uuid}`);
    return ([entry]) => {
      return encounterIds.includes(entry.encounter.reference);
    };
  }, [encounters]);

  return (
    <ExtensionSlot
      extensionSlotName="test-results-filtered-overview"
      state={{ filter, patientUuid } as RecentOverviewProps}
    />
  );
};

export default TestsSummary;
