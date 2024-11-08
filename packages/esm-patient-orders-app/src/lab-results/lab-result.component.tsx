import { Tile, InlineLoading } from '@carbon/react';
import { type Order } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  isCoded,
  isNumeric,
  isPanel,
  isText,
  useCompletedLabResults,
  useOrderConceptByUuid,
} from './lab-results.resource';
import { InlineNotification } from '@carbon/react';
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
      {isCoded(concept) && (
        <OrderDetail
          label={concept?.display}
          value={completeLabResult?.value?.display ?? (completeLabResult?.value as any)}
        />
      )}
      {isText(concept) && (
        <OrderDetail
          label={concept?.display}
          value={completeLabResult?.value?.display ?? (completeLabResult?.value as any)}
        />
      )}
      {isNumeric(concept) && (
        <OrderDetail
          label={concept?.display}
          value={completeLabResult?.value?.display ?? (completeLabResult?.value as any)}
        />
      )}
      {isPanel(concept) && (
        <div className={styles.detailsContainer}>
          {concept.setMembers.map((member, index) => {
            const obs = completeLabResult?.groupMembers.find((v) => v?.concept?.uuid === member.uuid);
            return (
              <OrderDetail key={index} label={member.display} value={obs?.value?.display ?? (obs?.value as any)} />
            );
          })}
        </div>
      )}
    </Tile>
  );
};

export default LabResults;

const OrderDetail = ({ label, value }: { label: string; value?: string }) => {
  return (
    <div className={styles.resultDetail}>
      <span>{label}</span>
      <span>:</span>
      <strong>{value ?? '--'}</strong>
    </div>
  );
};
