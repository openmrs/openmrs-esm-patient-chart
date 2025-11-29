import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar, updateVisit, useVisit } from '@openmrs/esm-framework';
import { AccessibleModal } from '../../components/accessible-modal';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import styles from './end-visit-dialog.scss';

interface EndVisitDialogProps {
  patientUuid: string;
  closeModal: () => void;
}

/**
 * This modal shows up when user clicks on the "End visit" button in the action menu within the
 * patient banner. It should only show when the patient has an active visit. See stop-visit.component.tsx
 * for the button.
 *
 * This dialog uses the patient chart store and SHOULD only be mounted within the patient chart
 */
const EndVisitDialog: React.FC<EndVisitDialogProps> = ({ patientUuid, closeModal }) => {
  const { t } = useTranslation();
  const { activeVisit, mutate } = useVisit(patientUuid);
  const { visitContext, setVisitContext } = usePatientChartStore(patientUuid);

  const handleEndVisit = () => {
    if (activeVisit) {
      const endVisitPayload = {
        stopDatetime: new Date(),
      };

      const abortController = new AbortController();

      updateVisit(activeVisit.uuid, endVisitPayload, abortController)
        .then((response) => {
          mutate();
          window.dispatchEvent(new CustomEvent('queue-entry-updated'));
          closeModal();
          if (visitContext?.uuid === activeVisit.uuid) {
            setVisitContext(null, null);
          }
          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            subtitle: t('visitEndSuccessfully', `${response?.data?.visitType?.display} ended successfully`),
            title: t('visitEnded', 'Visit ended'),
          });
        })
        .catch((error) => {
          showSnackbar({
            title: t('errorEndingVisit', 'Error ending visit'),
            kind: 'error',
            isLowContrast: false,
            subtitle: error?.message,
          });
        });
    }
  };

  return (
    <AccessibleModal
      isOpen={true}
      onClose={closeModal}
      size="sm"
      modalHeadingId="end-visit-modal-heading"
      modalDescriptionId="end-visit-modal-description"
    >
      <ModalHeader
        closeModal={closeModal}
        title={
          <span id="end-visit-modal-heading">
            {t('endActiveVisitConfirmation', 'Are you sure you want to end this active visit?')}
          </span>
        }
      />
      <ModalBody>
        <p id="end-visit-modal-description" className={styles.bodyShort02}>
          {t('youCanAddAdditionalEncounters', 'You can add additional encounters to this visit in the visit summary.')}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleEndVisit}>
          {t('endVisit_title', 'End Visit')}
        </Button>
      </ModalFooter>
    </AccessibleModal>
  );
};

export default EndVisitDialog;
