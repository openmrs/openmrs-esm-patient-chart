import React, { useMemo, useState } from 'react';
import { orderBy } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Dropdown, Form, InlineLoading, Search, Tile, Toggle, Stack } from '@carbon/react';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, showSnackbar, parseDate, formatDate, ResponsiveWrapper } from '@openmrs/esm-framework';
import { usePatientFlags, enablePatientFlag, disablePatientFlag } from './hooks/usePatientFlags';
import { getFlagType } from './utils';
import styles from './flags-list.scss';

type SortKey = 'alpha' | 'active' | 'retired';

const FlagsList: React.FC<PatientWorkspace2DefinitionProps<{}, {}>> = ({
  closeWorkspace,
  groupProps: { patientUuid },
}) => {
  const { t } = useTranslation();
  const { flags, isLoading, error, mutate } = usePatientFlags(patientUuid);
  const isTablet = useLayoutType() === 'tablet';
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('alpha');

  const sortItems = useMemo(
    () => [
      { id: 'alpha' as const, label: t('alphabetically', 'A - Z') },
      { id: 'active' as const, label: t('activeFirst', 'Active first') },
      { id: 'retired' as const, label: t('retiredFirst', 'Retired first') },
    ],
    [t],
  );

  const sortedRows = useMemo(() => {
    if (!sortBy) {
      return flags;
    }
    if (sortBy === 'active') {
      return orderBy(flags, [(item) => Number(item.voided)], ['asc']);
    }
    if (sortBy === 'retired') {
      return orderBy(flags, [(item) => Number(item.voided)], ['desc']);
    }
    return orderBy(flags, [(f) => f.flag.display], ['asc']);
  }, [sortBy, flags]);

  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (query) {
      return sortedRows.filter((f) => f.flag.display.toLowerCase().includes(query));
    }
    return sortedRows;
  }, [searchTerm, sortedRows]);

  const handleSortByChange = ({ selectedItem }) => setSortBy(selectedItem?.id as SortKey);

  const handleEnableFlag = async (flagUuid) => {
    setIsEnabling(true);
    try {
      const res = await enablePatientFlag(flagUuid);
      if (!res.ok) {
        throw new Error('Enable flag failed');
      }
      mutate();
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        subtitle: t('flagEnabledSuccessfully', 'Flag successfully enabled'),
        title: t('enabledFlag', 'Enabled flag'),
      });
    } catch (e) {
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        subtitle: t('flagEnableError', 'Error enabling flag'),
        title: t('enableFlagError', 'Enable flag error'),
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisableFlag = async (flagUuid) => {
    setIsDisabling(true);
    try {
      const res = await disablePatientFlag(flagUuid);
      if (!res.ok) {
        throw new Error('Disable flag failed');
      }
      mutate();
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        subtitle: t('flagDisabledSuccessfully', 'Flag successfully disabled'),
        title: t('flagDisabled', 'Flag disabled'),
      });
    } catch (e) {
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        subtitle: t('flagDisableError', 'Error disabling the flag'),
        title: t('disableFlagError', 'Disable flag error'),
      });
    } finally {
      setIsDisabling(false);
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
        <ResponsiveWrapper>
          <Search
            labelText={t('searchForAFlag', 'Search for a flag')}
            placeholder={t('searchForAFlag', 'Search for a flag')}
            value={searchTerm}
            size={isTablet ? 'lg' : 'md'}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                    label=""
                    type="inline"
                    items={sortItems}
                    itemToString={(item) => item?.label ?? ''}
                    selectedItem={sortItems.find((item) => item.id === sortBy)}
                    onChange={handleSortByChange}
                    titleText={t('sortBy', 'Sort by')}
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
                        <span className={styles.type}>
                          {(() => {
                            const typeLabel = getFlagType(result.tags);
                            return typeLabel ? t(typeLabel, typeLabel) : t('clinical', 'Clinical');
                          })()}
                        </span>
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
                          <span className={styles.label}>{t('assigned', 'Assigned')}</span>
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
          onClick={() => closeWorkspace({ discardUnsavedChanges: true })}
        >
          {(() => {
            if (isEnabling) return t('enablingFlag', 'Enabling flag...');
            if (isDisabling) return t('disablingFlag', 'Disabling flag...');
            return t('saveAndClose', 'Save & close');
          })()}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default FlagsList;
