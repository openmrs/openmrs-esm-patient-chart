import React from 'react';
import { type Visit } from '@openmrs/esm-framework';
import VisitSummary from './past-visits-components/visit-summary.component';

interface VisitSummaryExtensionProps {
  visit?: Visit;
  patientUuid?: string;
}

/**
 * Renders the visit summary from slot state so apps outside the patient chart (e.g. Service Queues)
 * can attach it to a slot and pass the visit context as state.
 */
const VisitSummaryExtension: React.FC<VisitSummaryExtensionProps> = ({ visit, patientUuid }) => {
  if (!visit || !patientUuid) {
    return null;
  }

  return <VisitSummary visit={visit} patientUuid={patientUuid} />;
};

export default VisitSummaryExtension;
