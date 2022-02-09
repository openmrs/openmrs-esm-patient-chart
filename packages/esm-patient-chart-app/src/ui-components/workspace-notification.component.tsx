import React, { useMemo } from 'react';
import { cancelOpeningWorkspace, confirmOpeningWorkspace, useWorkspaces } from '@openmrs/esm-patient-common-lib';
import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from 'carbon-components-react';
import { Trans, useTranslation } from 'react-i18next';
import styles from './workspace-notification.component.scss';

const WorkspaceNotification: React.FC = () => {
  const { t } = useTranslation();
  const { workspaces, workspaceNeedingConfirmationToOpen } = useWorkspaces();

  const existingFormName = useMemo(() => {
    return workspaces.filter((w) => w.type == workspaceNeedingConfirmationToOpen?.type)[0]?.title ?? '';
  }, [workspaces, workspaceNeedingConfirmationToOpen]);

  return (
    <ComposedModal open={workspaceNeedingConfirmationToOpen != null} onClose={cancelOpeningWorkspace}>
      <ModalHeader
        label={t('workspaceWarning', 'Workspace warning')}
        title={t('activeFormWarning', 'There is an active form open in the workspace')}
      ></ModalHeader>
      <ModalBody>
        <p className={styles.messageBody}>
          <Trans i18nKey="workspaceModalText" values={{ formName: existingFormName }}>
            Launching a new form in the workspace could cause you to lose unsaved work on the{' '}
            <strong>{existingFormName}</strong> form.
          </Trans>
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={cancelOpeningWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={confirmOpeningWorkspace}>
          {t('openAnyway', 'Open anyway')}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default WorkspaceNotification;
