import React from 'react';

import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface ConfirmationDialogProps {
  closeDialog: () => void;
  leavePatientChart: (e: any) => void;
  props: {
    type?: string;
    title?: string;
    additionalProps?: {
      workspaceTitle?: string;
    };
  };
}

const ConfirmLeavingPatientChart: React.FC<ConfirmationDialogProps> = ({ closeDialog, leavePatientChart, props }) => {
  const { t } = useTranslation();
  const { type = '', title = '', additionalProps = {} } = props;
  const workspaceTitle = additionalProps?.workspaceTitle;

  return (
    <div>
      <ModalHeader
        closeModal={closeDialog}
        title={t('openWorkspaceWarningHeader', "You haven't saved the {formTitle}", { formTitle: title })}
      />
      <ModalBody>
        {type === 'form'
          ? workspaceTitle
            ? t(
                'openFormSpecificWarningText',
                'The {workspaceTitle} form will not be saved if you exit the patient chart now, please or discard the form before you exit.',
                { workspaceTitle },
              )
            : t(
                'openFormWarningText',
                'The form will not be saved if you exit the patient chart now, please or discard the form before you exit.',
              )
          : type === 'order'
          ? t(
              'openOrderBasketWarningText',
              'The orders will not be saved if you exit the patient chart now, please or discard the form before you exit.',
            )
          : t(
              'openVisitNoteWarningText',
              'The visit note will not be saved if you exit the patient chart now, please or discard the note before you exit.',
            )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeDialog}>
          {t('returnToPatientChart', 'Return to patient chart')}
        </Button>
        <Button
          kind="danger"
          onClick={(e) => {
            closeDialog();
            leavePatientChart(e);
          }}
        >
          {t('closePatientChart', 'Close patient chart')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default ConfirmLeavingPatientChart;
