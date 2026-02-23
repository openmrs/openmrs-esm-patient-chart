import React, { type ComponentProps, useCallback, useMemo, useState } from 'react';
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
  TableSelectAll,
  TableSelectRow,
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
  PrinterIcon,
  openmrsFetch,
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
  isSelectable,
}) => {
  const { t } = useTranslation();
  const pageSizes = [10, 20, 30, 40, 50];
  const desktopLayout = isDesktop(useLayoutType());
  const session = useSession();
  const { mutateVisitContext, patient } = usePatientChartStore(patientUuid);
  const { mutate } = useSWRConfig();
  const responsiveSize = desktopLayout ? 'sm' : 'lg';
  const { data: encounterTypes, isLoading: isLoadingEncounterTypes } = useEncounterTypes();
  const enableEmbeddedFormView = useFeatureFlag('enable-embedded-form-view');
  const { encounterEditableDuration, encounterEditableDurationOverridePrivileges } = useConfig<ChartConfig>();
  const [isPrinting, setIsPrinting] = useState(false);

  const paginatedMappedEncounters = useMemo(
    () => (paginatedEncounters ?? []).map(mapEncounter).filter(Boolean),
    [paginatedEncounters],
  );

  const encountersByUuid = useMemo(
    () => new Map(paginatedMappedEncounters?.map((encounter) => [encounter.id, encounter]) ?? []),
    [paginatedMappedEncounters],
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

  const downloadPdf = async (encounterUuids: string[]) => {
    if (!encounterUuids || encounterUuids.length === 0) return;

    setIsPrinting(true);
    let currentJobId = null;

    try {
      const initResponse = await openmrsFetch('/ws/rest/v1/patientdocuments/encounters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(encounterUuids),
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initiate PDF generation.');
      }

      const initData = await initResponse.json();
      currentJobId = initData.uuid;

      showSnackbar({
        isLowContrast: true,
        title: t('generatingPdf', 'Generating PDF...'),
        kind: 'info',
        subtitle: t('pdfWillDownloadSoon', 'Your document is being generated and will download automatically.'),
      });

      let isCompleted = false;
      let isFailed = false;
      let attempts = 0;
      const maxAttempts = 60;

      while (!isCompleted && !isFailed && attempts < maxAttempts) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const statusResponse = await openmrsFetch(`/ws/rest/v1/patientdocuments/encounters/status/${currentJobId}`);
        if (!statusResponse.ok) {
          continue;
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'COMPLETED') {
          isCompleted = true;
        } else if (statusData.status === 'FAILED') {
          isFailed = true;
          throw new Error(statusData.error || 'Server failed to generate the report.');
        }
      }

      if (!isCompleted) {
        throw new Error('Report generation timed out. Please try again or select fewer encounters.');
      }

      const downloadResponse = await openmrsFetch(`/ws/rest/v1/patientdocuments/encounters/download/${currentJobId}`);

      if (!downloadResponse.ok) {
        throw new Error('Failed to download the generated PDF.');
      }

      const blob = await downloadResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = downloadResponse.headers.get('Content-Disposition');
      let fileName = 'EncountersReport.pdf';
      if (contentDisposition && contentDisposition.includes('filename=')) {
        fileName = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSnackbar({
        isLowContrast: true,
        title: t('printSuccess', 'Print successful'),
        kind: 'success',
        subtitle: t('pdfDownloaded', 'PDF has been downloaded successfully'),
      });
    } catch (error) {
      console.error('Error in async PDF flow:', error);
      showSnackbar({
        isLowContrast: false,
        title: t('error', 'Error'),
        kind: 'error',
        subtitle: error.message || t('printError', 'Failed to generate PDF. Please check server logs.'),
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintSelected = (selectedRows: Array<any>) => {
    const selectedEncounterUuids = selectedRows.map((row) => row.id);
    downloadPdf(selectedEncounterUuids);
  };

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
          getSelectionProps,
          selectedRows,
        }: {
          headers: Array<{ header: React.ReactNode; key: string }>;
          rows: Array<{ id: string; isExpanded: boolean; cells: Array<{ id: string; value: React.ReactNode }> }>;
          [key: string]: any;
        }) => {
          const selectedRowsCount = selectedRows.length;
          return (
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
                    {isSelectable && (
                      <Button
                        kind="ghost"
                        size={responsiveSize}
                        renderIcon={PrinterIcon}
                        disabled={selectedRowsCount === 0 || isPrinting}
                        onClick={() => handlePrintSelected(selectedRows)}
                      >
                        {isPrinting ? t('generating', 'Generating...') : t('printSelected', 'Print selected')}
                      </Button>
                    )}
                  </TableToolbarContent>
                </TableToolbar>
              )}
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {isSelectable && <TableSelectAll {...getSelectionProps()} />}
                    {headers.map((header, i) => (
                      <TableHeader className={styles.tableHeader} key={i} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                    <TableHeader aria-label={t('actions', 'Actions')} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows?.map((row) => {
                    const encounter = encountersByUuid.get(row.id);

                    if (!encounter) return null;

                    const isVisitNoteEncounter = (encounter: MappedEncounter) =>
                      encounter.encounterType === 'Visit Note' && !encounter.form;

                    const supportsEmbeddedFormView = (encounter: MappedEncounter) =>
                      encounter.form?.uuid &&
                      encounter.form.resources?.some((resource) => resource.name === jsonSchemaResourceName);

                    const encounterAgeInMinutes =
                      (Date.now() - new Date(encounter.rawDatetime).getTime()) / (1000 * 60);

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
                        {isSelectable && <TableSelectRow {...getSelectionProps({ row })} />}
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
                                  {supportsEmbeddedFormView(encounter) && (
                                    <OverflowMenuItem
                                      className={styles.menuItem}
                                      hasDivider
                                      isDelete /*  */
                                      itemText={t('printEncounter', 'Print this encounter')}
                                      disabled={isPrinting}
                                      onClick={() => downloadPdf([encounter.id])}
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
                                  visitUuid: encounter.visitUuid ?? null,
                                  visitTypeUuid: encounter.visitTypeUuid ?? null,
                                  visitStartDatetime: encounter.visitStartDatetime ?? null,
                                  visitStopDatetime: encounter.visitStopDatetime ?? null,
                                  patientUuid: patientUuid,
                                  patient: patient,
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
          );
        }}
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
