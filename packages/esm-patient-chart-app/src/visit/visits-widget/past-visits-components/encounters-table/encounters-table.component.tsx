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
  launchWorkspace,
  showModal,
  showSnackbar,
  TrashCanIcon,
  useConfig,
  useFeatureFlag,
  useLayoutType,
  userHasAccess,
  useSession,
  useVisit,
  type EncounterType,
  ExtensionSlot,
} from '@openmrs/esm-framework';
import {
  type HtmlFormEntryForm,
  launchFormEntryOrHtmlForms,
  invalidateVisitAndEncounterData,
} from '@openmrs/esm-patient-common-lib';
import {
  deleteEncounter,
  mapEncounter,
  useEncounterTypes,
  type EncountersTableProps,
  type MappedEncounter,
} from './encounters-table.resource';
import EncounterObservations from '../../encounter-observations';
import styles from './encounters-table.scss';

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
  const { mutate: mutateCurrentVisit } = useVisit(patientUuid);
  const { mutate } = useSWRConfig();
  const responsiveSize = desktopLayout ? 'sm' : 'lg';

  const { data: encounterTypes, isLoading: isLoadingEncounterTypes } = useEncounterTypes();
  const disableInlineSummary = useFeatureFlag('disable-inline-o3-form-summary');

  const formsConfig: { htmlFormEntryForms: HtmlFormEntryForm[] } = useConfig({
    externalModuleName: '@openmrs/esm-patient-forms-app',
  });
  const { htmlFormEntryForms } = formsConfig;
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
              mutateCurrentVisit();

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
    [mutate, mutateCurrentVisit, patientUuid, t],
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

                    const isFormAttached = encounter.form?.uuid;

                    return (
                      <React.Fragment key={encounter.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                          <TableCell className="cds--table-column-menu">
                            <Layer className={styles.layer}>
                              <OverflowMenu
                                aria-label={t('encounterTableActionsMenu', 'Encounter table actions menu')}
                                flipped
                                size={responsiveSize}
                              >
                                {userHasAccess(encounter.editPrivilege, session?.user) &&
                                  (isFormAttached || isVisitNoteEncounter(encounter)) && (
                                    <OverflowMenuItem
                                      className={styles.menuItem}
                                      itemText={t('editThisEncounter', 'Edit this encounter')}
                                      onClick={() => {
                                        if (isVisitNoteEncounter(encounter)) {
                                          launchWorkspace('visit-notes-form-workspace', {
                                            encounter,
                                            formContext: 'editing',
                                            patientUuid,
                                          });
                                        } else {
                                          launchFormEntryOrHtmlForms(
                                            htmlFormEntryForms,
                                            patientUuid,
                                            encounter.form,
                                            encounter.visitUuid,
                                            encounter.id,
                                            encounter.visitTypeUuid,
                                            encounter.visitStartDatetime,
                                            encounter.visitStopDatetime,
                                          );
                                        }
                                      }}
                                    />
                                  )}
                                {userHasAccess(encounter.editPrivilege, session?.user) && (
                                  <OverflowMenuItem
                                    className={styles.menuItem}
                                    hasDivider
                                    isDelete
                                    itemText={t('deleteThisEncounter', 'Delete this encounter')}
                                    onClick={() => handleDeleteEncounter(encounter.id, encounter.form?.display)}
                                  />
                                )}
                              </OverflowMenu>
                            </Layer>
                          </TableCell>
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 2}>
                            <>
                              {isFormAttached && !disableInlineSummary ? (
                                <ExtensionSlot
                                  name="form-summary-slot"
                                  state={{
                                    mode: 'embedded-view',
                                    patientUUID: patientUuid,
                                    formUUID: encounter?.form?.uuid,
                                    encounterUUID: encounter?.id,
                                  }}
                                />
                              ) : (
                                <EncounterObservations observations={encounter.obs} />
                              )}
                              {userHasAccess(encounter.editPrivilege, session?.user) && (
                                <>
                                  {(isFormAttached || isVisitNoteEncounter(encounter)) && (
                                    <Button
                                      kind="ghost"
                                      onClick={() => {
                                        if (isVisitNoteEncounter(encounter)) {
                                          launchWorkspace('visit-notes-form-workspace', {
                                            encounter,
                                            formContext: 'editing',
                                            patientUuid,
                                          });
                                        } else {
                                          launchFormEntryOrHtmlForms(
                                            htmlFormEntryForms,
                                            patientUuid,
                                            encounter.form,
                                            encounter.visitUuid,
                                            encounter.id,
                                            encounter.visitTypeUuid,
                                            encounter.visitStartDatetime,
                                            encounter.visitStopDatetime,
                                          );
                                        }
                                      }}
                                      renderIcon={(props: ComponentProps<typeof EditIcon>) => (
                                        <EditIcon size={16} {...props} />
                                      )}
                                    >
                                      {t('editThisEncounter', 'Edit this encounter')}
                                    </Button>
                                  )}
                                  <Button
                                    kind="danger--ghost"
                                    onClick={() => handleDeleteEncounter(encounter.id, encounter.form?.display)}
                                    renderIcon={(props: ComponentProps<typeof TrashCanIcon>) => (
                                      <TrashCanIcon size={16} {...props} />
                                    )}
                                  >
                                    {t('deleteThisEncounter', 'Delete this encounter')}
                                  </Button>
                                </>
                              )}
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
