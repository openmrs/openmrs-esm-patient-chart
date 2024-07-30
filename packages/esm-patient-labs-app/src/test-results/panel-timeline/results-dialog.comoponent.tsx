import React from 'react';
import { ModalHeader } from '@carbon/react';
import { ModalBody } from '@carbon/react';
import Trendline from '../trendline/trendline.component';
import { basePath } from '@openmrs/esm-patient-chart-app/src/constants';

interface ResultsModalProps {
  closeDeleteModal: () => void;
  patientUuid: string;
  title: string;
  testUuid: string;
  range: any;
  units: any;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ closeDeleteModal, patientUuid, testUuid }) => {
  return (
    <div>
      <ModalHeader title="Trendline" closeModal={closeDeleteModal} />
      <ModalBody>
        <Trendline patientUuid={patientUuid} conceptUuid={testUuid} basePath={basePath} />
      </ModalBody>
    </div>
  );
};

export default ResultsModal;
