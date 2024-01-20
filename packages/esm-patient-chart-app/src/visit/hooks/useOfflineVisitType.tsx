import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type VisitType, useConfig } from '@openmrs/esm-framework';
import { type ChartConfig } from '../../config-schema';

export const useOfflineVisitType = () => {
  const { t } = useTranslation();
  const config = useConfig() as ChartConfig;
  const [visitTypes, setVisitTypes] = useState<Array<VisitType>>([]);

  useEffect(() => {
    setVisitTypes([
      { uuid: config.offlineVisitTypeUuid, name: 'Offline Visit', display: t('offlineVisit', 'Offline Visit') },
    ]);
  }, []);

  return visitTypes;
};
