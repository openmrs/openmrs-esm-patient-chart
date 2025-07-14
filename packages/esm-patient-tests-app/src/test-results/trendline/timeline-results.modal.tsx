import React from 'react';
import { ModalHeader, ModalBody } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { basePath } from '../../constants';
import Trendline from './trendline.component';

interface TimelineResultsModalProps {
  closeDeleteModal: () => void;
  patientUuid: string;
  testUuid: string;
  title: string;
}

const TimelineResultsModal: React.FC<TimelineResultsModalProps> = ({ closeDeleteModal, patientUuid, testUuid }) => {
  const { t } = useTranslation();

  return (
    <div>
      <ModalHeader title={t('trendline', 'Trendline')} closeModal={closeDeleteModal} />
      <ModalBody>
        <Trendline basePath={basePath} conceptUuid={testUuid} patientUuid={patientUuid} />
      </ModalBody>
    </div>
  );
};

export default TimelineResultsModal;
