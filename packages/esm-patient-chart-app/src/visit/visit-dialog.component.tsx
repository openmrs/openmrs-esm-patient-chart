import React, { useState, useEffect, useCallback } from 'react';
import styles from './visit-dialog.css';
import { useVisitDialog } from '../hooks/useVisitDialog';
import StartVisitPrompt from './visit-prompt/start-visit.component';
import EndVisitPrompt from './visit-prompt/end-visit.component';

interface VisitDialogProps {
  patientUuid: string;
}

const VisitDialog: React.FC<VisitDialogProps> = ({ patientUuid }) => {
  const { type } = useVisitDialog(patientUuid);
  const closeModal = () => {
    window.dispatchEvent(new CustomEvent('visit-dialog', { detail: { type: 'close' } }));
  };

  return (
    <>
      <StartVisitPrompt openModal={type == 'start'} />
      <EndVisitPrompt openModal={type === 'end'} patientUuid={patientUuid} closeModal={closeModal} />
    </>
  );
};

export default VisitDialog;
