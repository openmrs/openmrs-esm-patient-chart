import React from 'react';
import { InlineLoading, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { useCompletedLabResults, useOrderConceptByUuid } from './lab-results.resource';
import TestOrder from '../components/test-order.component';

type LabResultsProps = {
  order: Order;
};
const LabResults: React.FC<LabResultsProps> = ({ order }) => {
  const { t } = useTranslation();
  const { isLoading: isLoadingConcepts, error: conceptError } = useOrderConceptByUuid(order.concept.uuid);
  const { isLoading, error } = useCompletedLabResults(order);

  if (isLoading || isLoadingConcepts)
    return (
      <InlineLoading
        status="active"
        iconDescription="Loading"
        description={t('loadinglabresults', 'Loading lab results') + '...'}
      />
    );

  if (error || conceptError)
    return (
      <InlineNotification
        kind="error"
        title={t('labResultError', 'Error loading lab results')}
        subtitle={error?.message ?? conceptError?.message}
      />
    );

  return <OrderDetail order={order} />;
};

export default LabResults;

const OrderDetail = ({ order }: { order: Order }) => {
  return <TestOrder testOrder={order} />;
};
