import React from 'react';
import { Tile, InlineLoading, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { useCompletedLabResults, useOrderConceptByUuid } from './lab-results.resource';
import TestOrder from '../components/test-order.component';
import styles from './lab-result.scss';

type LabResultsProps = {
  order: Order;
};
const LabResults: React.FC<LabResultsProps> = ({ order }) => {
  const { t } = useTranslation();
  const { concept, isLoading: isLoadingConcepts, error: conceptError } = useOrderConceptByUuid(order.concept.uuid);
  const { isLoading, error, completeLabResult, mutate } = useCompletedLabResults(order);

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

  return (
    <Tile className={styles.resultsCiontainer}>
      <OrderDetail order={order} />
    </Tile>
  );
};

export default LabResults;

const OrderDetail = ({ order }: { order: Order }) => {
  return <TestOrder testOrder={order} />;
};
