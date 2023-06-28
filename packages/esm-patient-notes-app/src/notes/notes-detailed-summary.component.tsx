import React from 'react';
import { useTranslation } from 'react-i18next';
import NotesMain from './notes-main.component';

interface NotesDetailedSummaryProps {
  patientUuid: string;
  basePath: string;
}

const NotesDetailedSummary: React.FC<NotesDetailedSummaryProps> = ({ patientUuid, basePath }) => {
  const pageSize = 10;
  const { t } = useTranslation();
  const pageUrl: string = `$\{openmrsSpaBase}/patient/${patientUuid}/chart`;
  const urlLabel = t('goToSummary', 'Go to Summary');

  return <NotesMain patientUuid={patientUuid} pageSize={pageSize} pageUrl={pageUrl} urlLabel={urlLabel} />;
};

export default NotesDetailedSummary;
