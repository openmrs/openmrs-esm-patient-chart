import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './workspace-notification.component.scss';
import { Button, ComposedModal, ModalBody, ModalHeader } from 'carbon-components-react';
import { patientChartWorkspaceSlot } from '../constants';
import { useAssignedExtensionIds, attach, detachAll, extensionStore } from '@openmrs/esm-framework';
import { getTitle } from '../utils';

const WorkspaceNotification: React.FC = () => {
  const { t } = useTranslation();
  const extensions = useAssignedExtensionIds(patientChartWorkspaceSlot);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [extensionSlotName, setExtensionSlotName] = useState<string>('');

  const formName = useMemo(() => {
    if (extensions.length === 1) {
      const state = extensionStore.getState();
      return getTitle(state.extensions[extensions[0]]);
    } else {
      return '';
    }
  }, [extensions]);

  const toggleActive = () => {
    setIsOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const handler = (ev: CustomEvent) => {
      const { state = {} } = ev.detail;
      const { extensionSlotName } = state;
      setExtensionSlotName(extensionSlotName);
      if (extensions.length > 0) {
        setIsOpen(true);
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
    <ComposedModal open={isOpen} onClose={toggleActive}>
      <ModalHeader>
        <span className={styles.productiveHeading04}>{t('activeWorkspaceText', { formName })}</span>
      </ModalHeader>
      <ModalBody>
        <p className={styles.messageBody}>{t('workspaceNotificationHelperText', { formName })}</p>
      </ModalBody>
      <div className={styles.buttonContainer}>
        <Button onClick={toggleActive} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={handleOpenNewForm} kind="danger">
          {t('closeCurrent', 'Open new form')}
        </Button>
      </div>
    </ComposedModal>
  );
};

export default WorkspaceNotification;
