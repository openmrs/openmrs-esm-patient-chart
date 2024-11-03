import React from 'react';
import { HeaderGlobalAction } from '@carbon/react';
import { getHistory, goBackInHistory, navigate, CloseFilledIcon } from '@openmrs/esm-framework';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './close-button.scss';

export function CloseButton({ patientUuid }: { patientUuid: string }) {
  const { t } = useTranslation();

  const onClosePatientChart = useCallback(() => {
    const history = getHistory();
    // Get the last page the user was on before opening the patient chart by going backward
    // through the history until a URL does not include patientUuid
    let onCloseTarget = '';
    for (let i = history.length - 1; i >= 0; i--) {
      if (!history[i].includes(patientUuid)) {
        onCloseTarget = history[i];
        break;
      }
    }

    if (onCloseTarget) {
      goBackInHistory({ toUrl: onCloseTarget });
    } else {
      navigate({ to: '${openmrsSpaBase}/home' });
    }
  }, [patientUuid]);

  return (
    <HeaderGlobalAction
      className={styles.headerGlobalBarCloseButton}
      aria-label={t('close', 'Close')}
      onClick={onClosePatientChart}
    >
      <CloseFilledIcon size={20} />
    </HeaderGlobalAction>
  );
}
