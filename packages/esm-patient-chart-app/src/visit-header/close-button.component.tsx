import React from 'react';
import { HeaderGlobalAction } from '@carbon/react';
import { CloseFilled } from '@carbon/react/icons';
import { getHistory, goBackInHistory, navigate, usePatient } from '@openmrs/esm-framework';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './close-button.scss';

/**
 * The close button keeps track of where each patient chart should close to, within the
 * context of the session.
 */
export function CloseButton() {
  const { t } = useTranslation();
  const { patientUuid } = usePatient();

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
      <CloseFilled size={20} />
    </HeaderGlobalAction>
  );
}
