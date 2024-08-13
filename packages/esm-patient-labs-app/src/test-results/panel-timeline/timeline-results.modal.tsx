import React from 'react';
import { ModalHeader, ModalBody } from '@carbon/react';
import Trendline from '../trendline/trendline.component';
import { useTranslation } from 'react-i18next';
import { basePath } from '../../constants';

interface TimelineResultsProps {
  closeDeleteModal: () => void;
  patientUuid: string;
  title: string;
  testUuid: string;
  range: any;
  units: any;
}

const TimelineResults: React.FC<TimelineResultsProps> = ({ closeDeleteModal, patientUuid, testUuid }) => {
  const { t } = useTranslation();

  return (
    <div>
      <ModalHeader title={t('trendline', 'Trendline')} closeModal={closeDeleteModal} />
      <ModalBody>
        <Trendline patientUuid={patientUuid} conceptUuid={testUuid} basePath={basePath} />
      </ModalBody>
    </div>
  );
};

export default TimelineResults;
