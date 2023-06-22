import React, { useState } from 'react';
import { Toggle, ButtonSet, Button, Search } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';

import { useFlagsFromPatient } from './hooks/usePatientFlags';
import Loader from '../loader/loader.component';

import styles from './patient-flags-list.scss';

const PatientFlagsList: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { flags, isLoadingFlags, flagLoadingError } = useFlagsFromPatient(patientUuid);
  const isTablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoadingFlags) {
    return <Loader />;
  }
  return (
    <div className={styles.flagsList}>
      <Search
        size="lg"
        light={isTablet}
        value={searchTerm}
        placeholder={t('searchForAFlag', 'Search for a flag')}
        labelText={t('searchForAFlag', 'Search for a flag')}
        onChange={(e) => setSearchTerm(e.currentTarget?.value ?? '')}
      />
      <div className={styles.flagsHeaderInfo}>
        <div>{flags.length} flags</div>
        <div>A - Z</div>
      </div>
      {flags.map((f) => (
        <div className={styles.flagTile}>
          <div className={styles.flagTitle}>{f.name}</div>
          <Toggle id={f.uuid} toggled={f.enabled} size="sm" hideLabel labelA="disabled" labelB="enabled" />
        </div>
      ))}
      <ButtonSet className={isTablet ? styles.tabletButtonSet : styles.desktopButtonSet}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit">
          {t('saveAndClose', 'Save and Close')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default PatientFlagsList;
