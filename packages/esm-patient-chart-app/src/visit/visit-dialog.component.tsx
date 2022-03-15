import React from 'react';
import StartVisit from './visit-prompt/start-visit.component';
import EndVisit from './visit-prompt/end-visit.component';
import CancelVisit from './visit-prompt/cancel-visit.component';

interface VisitDialogProps {
  patientUuid: string;
}

const VisitDialog: React.FC<VisitDialogProps> = ({ patientUuid }) => (
  <>
    <StartVisit patientUuid={patientUuid} />
    <EndVisit patientUuid={patientUuid} />
    <CancelVisit patientUuid={patientUuid} />
  </>
);

export default VisitDialog;
