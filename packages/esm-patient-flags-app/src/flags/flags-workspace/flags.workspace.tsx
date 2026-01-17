import React, { useCallback, useMemo, useState } from 'react';
import { orderBy } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Dropdown, Form, InlineLoading, Search, Tile, Toggle, Stack } from '@carbon/react';
import { type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import {
  useLayoutType,
  showSnackbar,
  parseDate,
  formatDate,
  ResponsiveWrapper,
  Workspace2,
} from '@openmrs/esm-framework';
import { usePatientFlags, enablePatientFlag, disablePatientFlag } from '../hooks/usePatientFlags';
import { getFlagType } from '../utils';
import styles from './flags-workspace.scss';

type SortKey = 'alpha' | 'active' | 'retired';

const FlagsWorkspace: React.FC<PatientWorkspace2DefinitionProps<{}, {}>> = ({
  closeWorkspace,
  groupProps: { patientUuid },
}) => {
  const { t } = useTranslation();
  const { flags, isLoading, error, mutate } = usePatientFlags(patientUuid);
  const isTablet = useLayoutType() === 'tablet';
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('alpha');
  // Track pending changes: Map of flagUuid -> desired active state
  const [pendingActiveStates, setPendingActiveStates] = useState<Map<string, boolean>>(new Map());

  const hasUnsavedChanges = pendingActiveStates.size > 0;

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
    return orderBy(flags, [(f) => f.message], ['asc']);
  }, [sortBy, flags]);

  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (query) {
      return sortedRows.filter((f) => f.message.toLowerCase().includes(query));
    }
    return sortedRows;
  }, [searchTerm, sortedRows]);

  const handleSortByChange = ({ selectedItem }) => setSortBy(selectedItem?.id as SortKey);

  // Get the effective active state for a flag (considering pending changes)
  const isActive = useCallback(
    (flagUuid: string, originallyActive: boolean) => {
      return pendingActiveStates.has(flagUuid) ? pendingActiveStates.get(flagUuid) : originallyActive;
    },
    [pendingActiveStates],
  );

  const handleToggle = useCallback((flagUuid: string, originallyActive: boolean, isNowActive: boolean) => {
    setPendingActiveStates((prev) => {
      const next = new Map(prev);
      if (isNowActive === originallyActive) {
        next.delete(flagUuid);
      } else {
        next.set(flagUuid, isNowActive);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (pendingActiveStates.size === 0) {
      closeWorkspace({ discardUnsavedChanges: true });
      return;
    }

    setIsSaving(true);
    const promises: Promise<{ flagUuid: string; success: boolean }>[] = [];

    pendingActiveStates.forEach((active, flagUuid) => {
      const promise = (active ? enablePatientFlag(flagUuid) : disablePatientFlag(flagUuid))
        .then((res) => ({ flagUuid, success: res.ok }))
        .catch(() => ({ flagUuid, success: false }));
      promises.push(promise);
    });

    const results = await Promise.all(promises);
    const failures = results.filter((r) => !r.success);

    if (failures.length === 0) {
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        subtitle: t('flagsUpdatedSuccessfully', 'Flags updated successfully'),
        title: t('flagsUpdated', 'Flags updated'),
      });
      mutate();
      closeWorkspace({ discardUnsavedChanges: true });
    } else {
      showSnackbar({
        isLowContrast: false,
        kind: 'error',
        subtitle: t('flagsUpdateError', 'Some flags failed to update'),
        title: t('updateError', 'Update error'),
      });
      // Clear successful changes from pending, keep failures
      setPendingActiveStates((prev) => {
        const next = new Map(prev);
        results.filter((r) => r.success).forEach((r) => next.delete(r.flagUuid));
        return next;
      });
      mutate();
    }

    setIsSaving(false);
  }, [pendingActiveStates, closeWorkspace, mutate, t]);

  if (isLoading) {
    return <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Workspace2 title={t('editPatientFlags', 'Edit patient flags')} hasUnsavedChanges={hasUnsavedChanges}>
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
                ? searchResults.map((result) => {
                    const originallyActive = !result.voided;
                    const active = isActive(result.uuid, originallyActive);
                    return (
                      <div className={styles.flagTile} key={result.uuid}>
                        <div className={styles.flagHeader}>
                          <div className={styles.titleAndType}>
                            <div className={styles.flagTitle}>{result.message}</div>&middot;
                            <span className={styles.type}>
                              {(() => {
                                const typeLabel = getFlagType(result.tags);
                                return typeLabel ? t(typeLabel, typeLabel) : t('clinical', 'Clinical');
                              })()}
                            </span>
                          </div>
                          <Toggle
                            className={styles.flagToggle}
                            toggled={active}
                            id={result.uuid}
                            labelA=""
                            labelB=""
                            onToggle={(isNowActive) => handleToggle(result.uuid, originallyActive, isNowActive)}
                            size="sm"
                          />
                        </div>
                        {active && (
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
                    );
                  })
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
          <Button className={styles.button} disabled={isSaving} kind="primary" type="button" onClick={handleSave}>
            {isSaving ? t('saving', 'Saving...') : t('saveAndClose', 'Save & close')}
          </Button>
        </ButtonSet>
      </Form>
    </Workspace2>
  );
};

export default FlagsWorkspace;
