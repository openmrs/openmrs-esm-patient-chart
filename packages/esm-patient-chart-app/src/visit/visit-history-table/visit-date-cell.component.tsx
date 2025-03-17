import { formatDate, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  visit: Visit;
}

const VisitDateCell: React.FC<Props> = ({ visit }) => {
  const { t } = useTranslation();
  const { startDatetime, stopDatetime } = visit;
  const from = formatDate(new Date(startDatetime));
  const to = stopDatetime ? formatDate(new Date(stopDatetime)) : null;

  return <>{to ? t('fromDateToDate', '{{from}} - {{to}}', { from, to }) : from}</>;
};

export default VisitDateCell;
