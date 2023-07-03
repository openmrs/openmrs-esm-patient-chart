import React, { useMemo, useState } from 'react';
import debounce from 'lodash-es/debounce';
import isEmpty from 'lodash-es/isEmpty';
import orderBy from 'lodash-es/orderBy';
import { Toggle, ButtonSet, Button, Search, Form, Dropdown, Stack } from '@carbon/react';
import { useLayoutType, showToast, showNotification, parseDate, formatDate } from '@openmrs/esm-framework';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';

import { useFlagsFromPatient, enablePatientFlag, disablePatientFlag } from './hooks/usePatientFlags';
import Loader from '../loader/loader.component';
import { getFlagType } from './utils';

import styles from './patient-flags-list.scss';

const PatientFlagsList: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { flags, isLoadingFlags, flagLoadingError, mutate } = useFlagsFromPatient(patientUuid);

  const enabledFlagsUuid = flags.filter((f) => !f.voided).map((f) => f.uuid);

  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const [sortBy, setSortBy] = useState('A - Z');

  const sortedRows = useMemo(() => {
    if (!sortBy) {
      return flags;
    }
    if (sortBy === 'Active first') {
      return orderBy(flags, [(item) => Number(item.voided)], 'asc');
    }
    if (sortBy === 'Retired first') {
      return orderBy(flags, [(item) => Number(item.voided)], 'desc');
    }
    return orderBy(flags, (f) => f.flag.display, 'asc');
  }, [sortBy, flags]);

  const isTablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    if (!isEmpty(searchTerm)) {
      return sortedRows.filter((f) => f.flag.display.toLowerCase().search(searchTerm.toLowerCase()) !== -1);
    } else {
      return sortedRows;
    }
  }, [searchTerm, sortedRows]);

  const handleSearch = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), [setSearchTerm]);

  const handleSortByChange = ({ selectedItem }: { selectedItem: string }) => setSortBy(selectedItem);

  const handleEnableFlag = async (flagUuid) => {
    setEnabling(true);
    const res = await enablePatientFlag(flagUuid);

    if (res.status === 200) {
      mutate();
      showToast({
        critical: true,
        kind: 'success',
        description: t('flagEnabled', 'Patient flag successfully enabled'),
        title: t('enablingFlag', 'Enabling flag'),
      });

      setEnabling(false);
    } else {
      showNotification({
        critical: true,
        kind: 'error',
        description: t('errorEnabling', 'There was a problem enabling the flag'),
        title: t('enablingFlag', 'Enabling flag'),
      });
    }
  };

  const handleDisableFlag = async (flagUuid) => {
    setDisabling(true);
    const res = await disablePatientFlag(flagUuid);

    if (res.status === 204) {
      mutate();
      showToast({
        critical: true,
        kind: 'success',
        description: t('flagDisabled', 'Patient flag successfully disabled'),
        title: t('disablingFlag', 'Disabling flag'),
      });

      setDisabling(false);
    } else {
      showNotification({
        critical: true,
        kind: 'error',
        description: t('errorDisabling', 'There was a problem disabling the flag'),
        title: t('disablingFlag', 'Disabling flag'),
      });
    }
  };

  if (isLoadingFlags) {
    return <Loader />;
  }
  if (flagLoadingError) {
    return <div>{flagLoadingError.message}</div>;
  }
  return (
    <Form className={styles.formWrapper}>
      <Stack gap={4}>
        <div className={styles.listWrapper}>
          <Search
            size="lg"
            light={isTablet}
            value={searchTerm}
            placeholder={t('searchForAFlag', 'Search for a flag')}
            labelText={t('searchForAFlag', 'Search for a flag')}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className={styles.flagsHeaderInfo}>
            <div>
              {searchResults.length} {searchResults.length > 1 ? 'flags' : 'flag'}
            </div>
            <div>
              <Dropdown
                className={styles.sortDropdown}
                id="sortBy"
                initialSelectedItem={'A - Z'}
                label=""
                titleText={t('sortBy', 'Sort by') + ':'}
                type="inline"
                items={['A - Z', t('activeFirst', 'Active first'), t('retiredFirst', 'Retired first')]}
                onChange={handleSortByChange}
              />
            </div>
          </div>
          {searchResults.length > 0 ? (
            searchResults.map((f) => (
              <div className={styles.flagTile} key={f.uuid}>
                <div className={styles.flagHeader}>
                  <div className={styles.titleAndType}>
                    <div className={styles.flagTitle}>{f.flag.display}</div> &#x2e;{' '}
                    <span className={styles.type}>{getFlagType(f.tags)}</span>
                  </div>
                  <Toggle
                    id={f.uuid}
                    size="sm"
                    toggled={enabledFlagsUuid.includes(f.uuid)}
                    labelA=""
                    labelB=""
                    className={styles.flagToggle}
                    onToggle={(on) => (on ? handleEnableFlag(f.uuid) : handleDisableFlag(f.uuid))}
                  />
                </div>
                {f.voided ? null : (
                  <div className={styles.secondRow}>
                    <div className={styles.extraColumns}>
                      <div className={styles.label}>Assigned</div>
                      <div>{formatDate(parseDate(f.auditInfo?.dateCreated), { time: false })}</div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.emptyText}>No flags found! please check your filters</div>
          )}
        </div>
      </Stack>
      <ButtonSet className={isTablet ? styles.tabletButtonSet : styles.desktopButtonSet}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          className={styles.button}
          disabled={enabling || disabling}
          kind="primary"
          type="submit"
          onClick={() => closeWorkspace()}
        >
          {enabling
            ? t('enablingFlag', 'Enabling flag...')
            : disabling
            ? t('disablingFlag', 'Disabling flag...')
            : t('saveAndClose', 'Save and Close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default PatientFlagsList;
