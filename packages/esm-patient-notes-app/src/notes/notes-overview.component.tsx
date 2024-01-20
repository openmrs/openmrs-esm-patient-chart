import React from 'react';
import { useTranslation } from 'react-i18next';
import NotesMain from './notes-main.component';

interface NotesOverviewProps {
  patientUuid: string;
  patient: fhir.Patient;
  basePath: string;
}

const NotesOverview: React.FC<NotesOverviewProps> = ({ patientUuid, patient }) => {
  const pageSize = 5;
  const { t } = useTranslation();
  const pageUrl = `\${openmrsSpaBase}/patient/${patient.id}/chart/Forms & Notes`;
  const urlLabel = t('seeAll', 'See all');

  return <NotesMain patientUuid={patientUuid} pageSize={pageSize} urlLabel={urlLabel} pageUrl={pageUrl} />;
};

export default NotesOverview;
