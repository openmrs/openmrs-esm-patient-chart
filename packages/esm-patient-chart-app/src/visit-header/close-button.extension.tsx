import { HeaderGlobalAction } from '@carbon/react';
import { CloseFilledIcon, getHistory, goBackInHistory, navigate } from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './close-button.scss';

function CloseButton() {
  const { t } = useTranslation();
  const { patientUuid } = usePatientChartStore();

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

  const inPatientChart = window.location.pathname.includes(`${window.openmrsBase}/spa/patient/${patientUuid}`);
  if (!patientUuid || !inPatientChart) {
    return null;
  }

  return (
    <HeaderGlobalAction
      aria-label={t('closePatientChart', 'Close patient chart')}
      className={styles.headerGlobalBarCloseButton}
      onClick={onClosePatientChart}
    >
      <CloseFilledIcon size={20} />
    </HeaderGlobalAction>
  );
}

export default CloseButton;
