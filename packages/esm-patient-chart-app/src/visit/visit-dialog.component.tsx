import React from 'react';
import { useVisitDialog } from './useVisitDialog';
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
      <StartVisitPrompt isModalOpen={type == 'prompt'} closeModal={closeModal} state={state} />
      <EndVisitPrompt isModalOpen={type === 'end'} patientUuid={patientUuid} closeModal={closeModal} />
    </>
  );
};

export default VisitDialog;
