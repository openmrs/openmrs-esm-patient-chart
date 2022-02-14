import React from 'react';
import { useTranslation } from 'react-i18next';
import NotesMain from './notes-main.component';

interface NotesDetailedSummaryProps {
  patientUuid: string;
  showAddNote: boolean;
  basePath: string;
}

const NotesDetailedSummary: React.FC<NotesDetailedSummaryProps> = ({ patientUuid, showAddNote, basePath }) => {
  const pageSize = 10;
  const { t } = useTranslation();
  const pageUrl = window.spaBase + basePath + '/summary';
  const urlLabel = t('goToSummary', 'Go to Summary');

  return (
    <NotesMain
      patientUuid={patientUuid}
      pageSize={pageSize}
      pageUrl={pageUrl}
      showAddNote={showAddNote}
      urlLabel={urlLabel}
    />
  );
};

export default NotesDetailedSummary;
