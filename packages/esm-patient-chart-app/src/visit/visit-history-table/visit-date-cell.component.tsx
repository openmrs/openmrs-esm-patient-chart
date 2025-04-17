import { formatDate, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  visit: Visit;
}

const VisitDateCell: React.FC<Props> = ({ visit }) => {
  const { t } = useTranslation();
  const { startDatetime, stopDatetime } = visit;
  const fromDate = formatDate(new Date(startDatetime));
  const toDate = stopDatetime ? formatDate(new Date(stopDatetime)) : null;

  return <>{toDate ? t('fromDateToDate', '{{fromDate}} - {{toDate}}', { fromDate, toDate }) : fromDate}</>;
};

export default VisitDateCell;
