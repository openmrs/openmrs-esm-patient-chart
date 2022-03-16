import React from 'react';
import StartVisitDialog from './visit-prompt/start-visit-dialog.component';
import EndVisitDialog from './visit-prompt/end-visit-dialog.component';
import CancelVisitDialog from './visit-prompt/cancel-visit-dialog.component';
import { useVisitDialog } from './useVisitDialog';

interface VisitDialogProps {
  patientUuid: string;
}

const VisitDialog: React.FC<VisitDialogProps> = ({ patientUuid }) => {
  const { type } = useVisitDialog(patientUuid);

  if (type === 'cancel') return <CancelVisitDialog patientUuid={patientUuid} />;
  if (type === 'end') return <EndVisitDialog patientUuid={patientUuid} />;
  if (type === 'prompt') return <StartVisitDialog patientUuid={patientUuid} />;
  return null;
};

export default VisitDialog;
