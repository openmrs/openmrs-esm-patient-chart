import { type VisitType, useConfig } from '@openmrs/esm-framework';
import { type ChartConfig } from '../../config-schema';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useOfflineVisitType = () => {
  const config = useConfig() as ChartConfig;
  const { t } = useTranslation();
  const [visitTypes, setVisitTypes] = useState<Array<VisitType>>([]);

  useEffect(() => {
    setVisitTypes([
      { uuid: config.offlineVisitTypeUuid, name: 'Offline Visit', display: t('offlineVisit', 'Offline Visit') },
    ]);
  }, [t, config.offlineVisitTypeUuid]);

  return visitTypes;
};
