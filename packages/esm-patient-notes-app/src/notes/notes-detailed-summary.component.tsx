import React from 'react';
import { useTranslation } from 'react-i18next';
import NotesMain from './notes-main.component';

interface NotesDetailsProps {
  patientUuid: string;
  patient: fhir.Patient;
  showAddNote: boolean;
  basePath: string;
}

const NotesDetailedSummary: React.FC<NotesDetailsProps> = ({ patientUuid, patient, showAddNote, basePath }) => {
  const pageSize = 10;
  const { t } = useTranslation();
  const pageUrl = window.spaBase + basePath + '/summary';
  const urlLabel = t('goToSummary', 'Go to Summary');

  return (
    <NotesMain
      patientUuid={patientUuid}
      patient={patient}
      showAddNote={showAddNote}
      pageSize={pageSize}
      urlLabel={urlLabel}
      pageUrl={pageUrl}
    />
  );
};

export default NotesDetailedSummary;
