import React, { useMemo, useRef, useState } from 'react';
import debounce from 'lodash-es/debounce';
import isEmpty from 'lodash-es/isEmpty';
import orderBy from 'lodash-es/orderBy';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Dropdown, Form, InlineLoading, Layer, Search, Tile, Toggle, Stack } from '@carbon/react';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, showToast, showNotification, parseDate, formatDate } from '@openmrs/esm-framework';
import { usePatientFlags, enablePatientFlag, disablePatientFlag } from './hooks/usePatientFlags';
import { getFlagType } from './utils';
import styles from './flags-list.scss';

type dropdownFilter = 'A - Z' | 'Active first' | 'Retired first';

const FlagsList: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const { flags, isLoading, error, mutate } = usePatientFlags(patientUuid);
  const isTablet = useLayoutType() === 'tablet';

  const searchRef = useRef(null);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<dropdownFilter>('A - Z');

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

  const searchResults = useMemo(() => {
    if (!isEmpty(searchTerm)) {
      return sortedRows.filter((f) => f.flag.display.toLowerCase().search(searchTerm.toLowerCase()) !== -1);
    } else {
      return sortedRows;
    }
  }, [searchTerm, sortedRows]);

  const handleSearch = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), [setSearchTerm]);

  const handleSortByChange = ({ selectedItem }) => setSortBy(selectedItem);

  const handleEnableFlag = async (flagUuid) => {
    setIsEnabling(true);
    const res = await enablePatientFlag(flagUuid);

    if (res.status === 200) {
      mutate();
      setIsEnabling(false);
      showToast({
        critical: true,
        kind: 'success',
        description: t('flagEnabledSuccessfully', 'Flag successfully enabled'),
        title: t('enabledFlag', 'Enabled flag'),
      });
    } else {
      showNotification({
        critical: true,
        kind: 'error',
        description: t('flagEnableError', 'Error enabling flag'),
        title: t('flagEnabled', 'flag enabled'),
      });
    }
  };

  const handleDisableFlag = async (flagUuid) => {
    setIsDisabling(true);
    const res = await disablePatientFlag(flagUuid);

    if (res.status === 204) {
      mutate();
      setIsDisabling(false);
      showToast({
        critical: true,
        kind: 'success',
        description: t('flagDisabledSuccessfully', 'Flag successfully disabled'),
        title: t('flagDisabled', 'Flag disabled'),
      });
    } else {
      showNotification({
        critical: true,
        kind: 'error',
        description: t('flagDisableError', 'Error disabling the flag'),
        title: t('disableFlagError', 'Disable flag error'),
      });
    }
  };

  if (isLoading) {
    return <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Form className={styles.formWrapper}>
      {/* The <div> below is required to maintain the page layout styling */}
      <div>
        <ResponsiveWrapper isTablet={isTablet}>
          <Search
            labelText={t('searchForAFlag', 'Search for a flag')}
            placeholder={t('searchForAFlag', 'Search for a flag')}
            ref={searchRef}
            size={isTablet ? 'lg' : 'md'}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </ResponsiveWrapper>
        <Stack gap={4}>
          <div className={styles.listWrapper}>
            <div className={styles.flagsHeaderInfo}>
              {searchResults.length > 0 ? (
                <>
                  <span className={styles.resultsCount}>
                    {t('matchesForSearchTerm', '{{count}} flags', {
                      count: searchResults.length,
                    })}
                  </span>
                  <Dropdown
                    className={styles.sortDropdown}
                    id="sortBy"
                    initialSelectedItem={'A - Z'}
                    label=""
                    type="inline"
                    items={[
                      t('alphabetically', 'A - Z'),
                      t('activeFirst', 'Active first'),
                      t('retiredFirst', 'Retired first'),
                    ]}
                    onChange={handleSortByChange}
                  />
                </>
              ) : null}
            </div>
            {searchResults.length > 0
              ? searchResults.map((result) => (
                  <div className={styles.flagTile} key={result.uuid}>
                    <div className={styles.flagHeader}>
                      <div className={styles.titleAndType}>
                        <div className={styles.flagTitle}>{result.flag.display}</div>&middot;
                        <span className={styles.type}>{getFlagType(result.tags)}</span>
                      </div>
                      <Toggle
                        className={styles.flagToggle}
                        defaultToggled={!Boolean(result.voided)}
                        id={result.uuid}
                        labelA=""
                        labelB=""
                        onToggle={(on) => (on ? handleEnableFlag(result.uuid) : handleDisableFlag(result.uuid))}
                        size="sm"
                      />
                    </div>
                    {result.voided ? null : (
                      <div className={styles.secondRow}>
                        <div className={styles.metadata}>
                          <span className={styles.label}>Assigned</span>
                          <span className={styles.value}>
                            {formatDate(parseDate(result.auditInfo?.dateCreated), { time: false })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              : null}

            {searchResults.length === 0 ? (
              <div className={styles.emptyState}>
                <Tile className={styles.tile}>
                  <p className={styles.content}>{t('noFlagsFound', 'Sorry, no flags found matching your search')}</p>
                  <p className={styles.helper}>
                    <Button
                      kind="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        searchRef.current.value = '';
                        searchRef.current.focus();
                      }}
                    >
                      {t('clearSearch', 'Clear search')}
                    </Button>
                  </p>
                </Tile>
              </div>
            ) : null}
          </div>
        </Stack>
      </div>
      <ButtonSet className={isTablet ? styles.tabletButtonSet : styles.desktopButtonSet}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          className={styles.button}
          disabled={isEnabling || isDisabling}
          kind="primary"
          type="submit"
          onClick={() => closeWorkspace()}
        >
          {isEnabling
            ? t('enablingFlag', 'Enabling flag...')
            : isDisabling
            ? t('disablingFlag', 'Disabling flag...')
            : t('saveAndClose', 'Save & close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

export default FlagsList;
