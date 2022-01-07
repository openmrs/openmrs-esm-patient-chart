import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styles from './workspace-notification.component.scss';
import { Button, ComposedModal, ModalBody, ModalFooter, ModalHeader } from 'carbon-components-react';
import { patientChartWorkspaceSlot } from '../constants';
import { useAssignedExtensions, attach, detachAll, getExtensionInternalStore } from '@openmrs/esm-framework';
import { getTitle } from '../utils';

const WorkspaceNotification: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extensionSlotName, setExtensionSlotName] = useState('');
  const extensions = useAssignedExtensions(patientChartWorkspaceSlot);

  const formName = useMemo(() => {
    if (extensions.length === 1) {
      const state = getExtensionInternalStore().getState();
      return getTitle(state.extensions[extensions[0].name]);
    } else {
      return '';
    }
  }, [extensions]);

  const toggleActive = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const handler = (ev: CustomEvent) => {
      const { state = {} } = ev.detail;
      const { extensionSlotName } = state;
      setExtensionSlotName(extensionSlotName);
      if (extensions.length > 0) {
        setIsModalOpen(true);
      } else {
        attach(patientChartWorkspaceSlot, extensionSlotName);
      }
    };

    window.addEventListener('workspace-dialog', handler);
    return () => window.removeEventListener('workspace-dialog', handler);
  }, [extensions.length]);

  const handleOpenNewForm = () => {
    detachAll(patientChartWorkspaceSlot);
    attach(patientChartWorkspaceSlot, extensionSlotName);
    toggleActive();
  };

  return (
    <ComposedModal open={isModalOpen} onClose={toggleActive}>
      <ModalHeader
        label={t('workspaceWarning', 'Workspace warning')}
        title={t('activeFormWarning', 'There is an active form open in the workspace')}
      ></ModalHeader>
      <ModalBody>
        <p className={styles.messageBody}>
          <Trans i18nKey="workspaceModalText" values={{ formName: formName }}>
            Launching a new form in the workspace could cause you to lose unsaved work on the{' '}
            <strong>{formName}</strong> form.
          </Trans>
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={toggleActive}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleOpenNewForm}>
          {t('openAnyway', 'Open anyway')}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default WorkspaceNotification;
