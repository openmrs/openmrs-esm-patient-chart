import React from 'react';
import { useTranslation } from 'react-i18next';
import NotesMain from './notes-main.component';

interface NotesOverviewProps {
  patientUuid: string;
  patient: fhir.Patient;
  showAddNote: boolean;
  basePath: string;
}

const NotesOverview: React.FC<NotesOverviewProps> = ({ patientUuid, patient, showAddNote, basePath }) => {
  const pageSize = 5;
  const { t } = useTranslation();
  const pageUrl = window.spaBase + basePath + '/forms';
  const urlLabel = t('seeAll', 'See all');

  return (
    <NotesMain
      patientUuid={patientUuid}
      showAddNote={showAddNote}
      pageSize={pageSize}
      urlLabel={urlLabel}
      pageUrl={pageUrl}
    />
  );
};

export default NotesOverview;
