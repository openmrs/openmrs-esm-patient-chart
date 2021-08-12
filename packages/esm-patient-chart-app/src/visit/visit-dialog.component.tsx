import React from 'react';
import { useVisitDialog } from '../hooks/useVisitDialog';
import StartVisitPrompt from './visit-prompt/start-visit.component';
import EndVisitPrompt from './visit-prompt/end-visit.component';

interface VisitDialogProps {
  patientUuid: string;
}

const VisitDialog: React.FC<VisitDialogProps> = ({ patientUuid }) => {
  const { type, state } = useVisitDialog(patientUuid);
  const closeModal = () => {
    window.dispatchEvent(new CustomEvent('visit-dialog', { detail: { type: 'close' } }));
  };

  return (
    <>
      <StartVisitPrompt openModal={type == 'prompt'} closeModal={closeModal} state={state} />
      <EndVisitPrompt openModal={type === 'end'} patientUuid={patientUuid} closeModal={closeModal} />
    </>
  );
};

export default VisitDialog;
