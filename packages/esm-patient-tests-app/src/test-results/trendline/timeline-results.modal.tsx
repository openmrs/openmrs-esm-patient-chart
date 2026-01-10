import React from 'react';
import { ModalHeader, ModalBody } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import Trendline from './trendline.component';

interface TimelineResultsModalProps {
  closeDeleteModal: () => void;
  patientUuid: string;
  testUuid: string;
}

const TimelineResultsModal: React.FC<TimelineResultsModalProps> = ({ closeDeleteModal, patientUuid, testUuid }) => {
  const { t } = useTranslation();

  return (
    <>
      <ModalHeader title={t('trendline', 'Trendline')} closeModal={closeDeleteModal} />
      <ModalBody hasScrollingContent>
        <Trendline conceptUuid={testUuid} patientUuid={patientUuid} />
      </ModalBody>
    </>
  );
};

export default TimelineResultsModal;
