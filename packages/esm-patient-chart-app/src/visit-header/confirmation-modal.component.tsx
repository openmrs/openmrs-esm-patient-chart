import React from 'react';

import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface ConfirmationDialogProps {
  closeDialog: () => void;
  leavePatientChart: (e: any) => void;
  props: any;
}

const ConfirmLeavingPatientChart: React.FC<ConfirmationDialogProps> = ({ closeDialog, leavePatientChart, props }) => {
  const { t } = useTranslation();
  const { type = '', title = '', additionalProps = {} } = props;

  const unifiedTitle = title.includes('Form') ? title : `${title} Form`;
  const confirmationText =
    type === 'form'
      ? additionalProps?.workspaceTitle
        ? `The ${additionalProps?.workspaceTitle} form will not be saved if you exit the patient chart now.`
        : 'The form will not be saved if you exit the patient chart now'
      : null;

  const confirmationHeading = type === 'form' ? `You haven't saved the ${unifiedTitle}` : null;

  return (
    <div>
      <ModalHeader closeModal={closeDialog} title={t('openWorkspaceWarning', { confirmationHeading })} />
      <ModalBody>{t('closePatientChartText', { confirmationText })}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeDialog}>
          {t('no', 'No')}
        </Button>
        <Button
          kind="danger"
          onClick={(e) => {
            closeDialog();
            leavePatientChart(e);
          }}
        >
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default ConfirmLeavingPatientChart;
