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
  const workspaceTitle = additionalProps && additionalProps?.workspaceTitle;

  const unifiedTitle = title.includes('Form') ? title : `${title} Form`;

  return (
    <div>
      <ModalHeader
        closeModal={closeDialog}
        title={
          type === 'form'
            ? t('openFormWarningHeader', "You haven't saved the {formTitle}", { formTitle: unifiedTitle })
            : t('openWorkspaceWarningHeader', "You haven't saved this workspace")
        }
      />
      <ModalBody>
        {type === 'form' && workspaceTitle
          ? workspaceTitle
            ? t(
                'openFormSpecificWarningText',
                'The {workspaceTitle} form will not be saved if you exit the patient chart now.',
                { workspaceTitle },
              )
            : t('openFormWarningText', 'The form will not be saved if you exit the patient chart now.')
          : t('openWorkspaceWarningText', 'The workspace will not be saved if you exit the patient chart now.')}
      </ModalBody>
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
