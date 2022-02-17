import React from 'react';
import { cancelPrompt, useWorkspaces } from '@openmrs/esm-patient-common-lib';
import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import styles from './workspace-notification.component.scss';

// t('activeFormWarning', 'There is an active form open in the workspace')
// t('workspaceModalText', 'Launching a new form in the workspace could cause you to lose unsaved work on the {formName} form.')
// t('openAnyway', 'Open anyway')

const WorkspaceNotification: React.FC = () => {
  const { t } = useTranslation();
  const { prompt } = useWorkspaces();

  return (
    prompt != null && (
      <ComposedModal open={true} onClose={cancelPrompt}>
        <ModalHeader title={prompt.title}></ModalHeader>
        <ModalBody>
          <p className={styles.messageBody}>{prompt.body}</p>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={cancelPrompt}>
            {prompt.cancelText ?? t('cancel', 'Cancel')}
          </Button>
          <Button kind="danger" onClick={prompt.onConfirm}>
            {prompt.confirmText ?? t('confirm', 'Confirm')}
          </Button>
        </ModalFooter>
      </ComposedModal>
    )
  );
};

export default WorkspaceNotification;
