import React, { type ComponentProps, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import {
  Button,
  ComboBox,
  DataTable,
  DataTableSkeleton,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  Tile,
} from '@carbon/react';
import {
  EditIcon,
  isDesktop,
  launchWorkspace2,
  showModal,
  showSnackbar,
  TrashCanIcon,
  useConfig,
  useLayoutType,
  userHasAccess,
  useSession,
  type EncounterType,
  ExtensionSlot,
  useFeatureFlag,
} from '@openmrs/esm-framework';
import { invalidateVisitAndEncounterData, usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { jsonSchemaResourceName } from '../../../../constants';
import {
  deleteEncounter,
  mapEncounter,
  useEncounterTypes,
  type EncountersTableProps,
  type MappedEncounter,
} from './encounters-table.resource';
import EncounterObservations from '../../encounter-observations';
import styles from './encounters-table.scss';
import { type ChartConfig } from '../../../../config-schema';

/**
 * This components is used by the AllEncountersTable and VisitEncountersTable to display
 * a table of encounters, with the actual data, pagination and filtering logic passed in
 * as props.
 */
const EncountersTable: React.FC<EncountersTableProps> = ({
  currentPage,
  encounterTypeToFilter,
  goTo,
  isLoading,
  pageSize,
  paginatedEncounters,
  patientUuid,
  setEncounterTypeToFilter,
  setPageSize,
  showEncounterTypeFilter,
  showVisitType,
  totalCount,
}) => {
  const { t } = useTranslation();
  const pageSizes = [10, 20, 30, 40, 50];
  const desktopLayout = isDesktop(useLayoutType());
  const session = useSession();
  const { mutateVisitContext } = usePatientChartStore(patientUuid);
  const { mutate } = useSWRConfig();
  const responsiveSize = desktopLayout ? 'sm' : 'lg';
  const { data: encounterTypes, isLoading: isLoadingEncounterTypes } = useEncounterTypes();
  const enableEmbeddedFormView = useFeatureFlag('enable-embedded-form-view');
  const { encounterEditableDuration, encounterEditableDurationOverridePrivileges } = useConfig<ChartConfig>();
  const paginatedMappedEncounters = useMemo(
    () => (paginatedEncounters ?? []).map(mapEncounter).filter(Boolean),
    [paginatedEncounters],
  );

  const tableHeaders = [
    {
      header: t('dateAndTime', 'Date & time'),
      key: 'datetime',
    },
    ...(showVisitType
      ? [
          {
            header: t('visitType', 'Visit type'),
            key: 'visitType',
          },
        ]
      : []),
    {
      header: t('encounterType', 'Encounter type'),
      key: 'encounterType',
    },
    {
      header: t('form', 'Form name'),
      key: 'formName',
    },
    {
      header: t('provider', 'Provider'),
      key: 'provider',
    },
  ];

  const handleDeleteEncounter = useCallback(
    (encounterUuid: string, encounterTypeName?: string) => {
      const dispose = showModal('delete-encounter-modal', {
        close: () => dispose(),
        encounterTypeName: encounterTypeName || '',
        onConfirmation: () => {
          const abortController = new AbortController();
          deleteEncounter(encounterUuid, abortController)
            .then(() => {
              // Update current visit data for critical components
              mutateVisitContext?.();

              // Also invalidate visit history and encounter tables since the encounter was deleted
              invalidateVisitAndEncounterData(mutate, patientUuid);

              showSnackbar({
                isLowContrast: true,
                title: t('encounterDeleted', 'Encounter deleted'),
                subtitle: t('encounterSuccessfullyDeleted', 'The encounter has been deleted successfully'),
                kind: 'success',
              });
            })
            .catch(() => {
              showSnackbar({
                isLowContrast: false,
                title: t('error', 'Error'),
                subtitle: t(
                  'encounterWithError',
                  'The encounter could not be deleted successfully. If the error persists, please contact your system administrator.',
                ),
                kind: 'error',
              });
            });
          dispose();
        },
      });
    },
    [mutate, mutateVisitContext, patientUuid, t],
  );

  if (isLoadingEncounterTypes || isLoading) {
    return <DataTableSkeleton role="progressbar" zebra />;
  }

  return (
    <div className={styles.container}>
      <DataTable
        headers={tableHeaders}
        overflowMenuOnHover={desktopLayout}
        rows={paginatedMappedEncounters ?? []}
        size={responsiveSize}
        useZebraStyles={totalCount > 1 ? true : false}
      >
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getExpandHeaderProps,
          getToolbarProps,
          getTableProps,
        }: {
          headers: Array<{ header: React.ReactNode; key: string }>;
          rows: Array<{ isExpanded: boolean; cells: Array<{ id: string; value: React.ReactNode }> }>;
          [key: string]: any;
        }) => (
          <>
            <TableContainer className={styles.tableContainer}>
              {showEncounterTypeFilter && (
                <TableToolbar {...getToolbarProps()}>
                  <TableToolbarContent>
                    <div className={styles.filterContainer}>
                      <ComboBox
                        aria-label={t('filterByEncounterType', 'Filter by encounter type')}
                        className={styles.substitutionType}
                        id="encounterTypeFilter"
                        items={encounterTypes}
                        itemToString={(item: EncounterType) => item?.display}
                        onChange={({ selectedItem }) => setEncounterTypeToFilter(selectedItem)}
                        placeholder={t('filterByEncounterType', 'Filter by encounter type')}
                        selectedItem={encounterTypeToFilter}
                        size={responsiveSize}
                      />
                    </div>
                  </TableToolbarContent>
                </TableToolbar>
              )}
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header, i) => (
                      <TableHeader className={styles.tableHeader} key={i} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                    <TableHeader aria-label={t('actions', 'Actions')} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows?.map((row, i) => {
                    const encounter = paginatedMappedEncounters[i];

                    if (!encounter) return null;

                    const isVisitNoteEncounter = (encounter: MappedEncounter) =>
                      encounter.encounterType === 'Visit Note' && !encounter.form;

                    const supportsEmbeddedFormView = (encounter: MappedEncounter) =>
                      encounter.form?.uuid &&
                      encounter.form.resources?.some((resource) => resource.name === jsonSchemaResourceName);

                    const encounterAgeInMinutes = (Date.now() - new Date(encounter.datetime).getTime()) / (1000 * 60);

                    const canDeleteEncounter =
                      userHasAccess(encounter.editPrivilege, session?.user) &&
                      (encounterEditableDuration === 0 ||
                        (encounterEditableDuration > 0 && encounterAgeInMinutes <= encounterEditableDuration) ||
                        encounterEditableDurationOverridePrivileges.some((privilege) =>
                          userHasAccess(privilege, session?.user),
                        ));

                    const canEditEncounter =
                      canDeleteEncounter && (encounter.form?.uuid || isVisitNoteEncounter(encounter));

                    return (
                      <React.Fragment key={encounter.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                          <TableCell className="cds--table-column-menu">
                            <Layer className={styles.layer}>
                              {canDeleteEncounter && ( // equivalent to canDeleteEncounter || canEditEncounter
                                <OverflowMenu
                                  aria-label={t('encounterTableActionsMenu', 'Encounter table actions menu')}
                                  flipped
                                  size={responsiveSize}
                                  align="left"
                                >
                                  {canEditEncounter && (
                                    <OverflowMenuItem
                                      className={styles.menuItem}
                                      itemText={t('editThisEncounter', 'Edit this encounter')}
                                      onClick={() => {
                                        if (isVisitNoteEncounter(encounter)) {
                                          launchWorkspace2('visit-notes-form-workspace', {
                                            encounter,
                                            formContext: 'editing',
                                            patientUuid,
                                          });
                                        } else {
                                          launchWorkspace2('patient-form-entry-workspace', {
                                            form: encounter.form,
                                            encounterUuid: encounter.id,
                                          });
                                        }
                                      }}
                                    />
                                  )}
                                  {canDeleteEncounter && (
                                    <OverflowMenuItem
                                      className={styles.menuItem}
                                      hasDivider
                                      isDelete
                                      itemText={t('deleteThisEncounter', 'Delete this encounter')}
                                      onClick={() => handleDeleteEncounter(encounter.id, encounter.form?.display)}
                                    />
                                  )}
                                </OverflowMenu>
                              )}
                            </Layer>
                          </TableCell>
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 2}>
                            <>
                              {enableEmbeddedFormView && supportsEmbeddedFormView(encounter) ? (
                                <ExtensionSlot
                                  name="form-widget-slot"
                                  state={{
                                    additionalProps: { mode: 'embedded-view' },
                                    patientUuid: patientUuid,
                                    formUuid: encounter.form.uuid,
                                    encounterUuid: encounter.id,
                                    promptBeforeClosing: () => {},
                                  }}
                                />
                              ) : (
                                <EncounterObservations observations={encounter.obs} />
                              )}
                              <>
                                {canEditEncounter && (
                                  <Button
                                    kind="ghost"
                                    onClick={() => {
                                      if (isVisitNoteEncounter(encounter)) {
                                        launchWorkspace2('visit-notes-form-workspace', {
                                          encounter,
                                          formContext: 'editing',
                                          patientUuid,
                                        });
                                      } else {
                                        launchWorkspace2('patient-form-entry-workspace', {
                                          form: encounter.form,
                                          encounterUuid: encounter.id,
                                        });
                                      }
                                    }}
                                    renderIcon={(props: ComponentProps<typeof EditIcon>) => (
                                      <EditIcon size={16} {...props} />
                                    )}
                                  >
                                    {t('editThisEncounter', 'Edit this encounter')}
                                  </Button>
                                )}
                                {canDeleteEncounter && (
                                  <Button
                                    kind="danger--ghost"
                                    onClick={() => handleDeleteEncounter(encounter.id, encounter.form?.display)}
                                    renderIcon={(props: ComponentProps<typeof TrashCanIcon>) => (
                                      <TrashCanIcon size={16} {...props} />
                                    )}
                                  >
                                    {t('deleteThisEncounter', 'Delete this encounter')}
                                  </Button>
                                )}
                              </>
                            </>
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              {rows?.length === 0 && (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noEncountersToDisplay', 'No encounters to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </div>
              )}
            </TableContainer>
          </>
        )}
      </DataTable>
      {
        <Pagination
          forwardText={t('nextPage', 'Next page')}
          backwardText={t('previousPage', 'Previous page')}
          page={currentPage}
          pageSize={pageSize}
          pageSizes={pageSizes}
          totalItems={totalCount}
          onChange={({ pageSize: newPageSize, page }) => {
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize);
            }
            if (page !== currentPage) {
              goTo(page);
            }
          }}
        />
      }
    </div>
  );
};

export default EncountersTable;
