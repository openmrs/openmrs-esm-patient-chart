import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import first from 'lodash-es/first';
import {
  DataTable,
  DataTableHeader,
  DataTableRow,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { EmptyDataIllustration, PatientChartPagination, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { formatDatetime, useConfig, usePagination } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { CompletedFormInfo } from '../types';
import { launchFormEntryOrHtmlForms } from '../form-entry-interop';
import styles from './form-view.scss';

type FormsCategory = 'All' | 'Completed' | 'Recommended';

interface FormViewProps {
  category?: FormsCategory;
  forms: Array<CompletedFormInfo>;
  patientUuid: string;
  patient: fhir.Patient;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
}

interface FilterProps {
  rowIds: Array<string>;
  headers: Array<Record<string, string>>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
}

const FormView: React.FC<FormViewProps> = ({ category, forms, patientUuid, patient, pageSize, pageUrl, urlLabel }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const htmlFormEntryForms = config.htmlFormEntryForms;
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const { results, goTo, currentPage } = usePagination(
    forms?.sort((a, b) => (b.lastCompleted?.getTime() ?? 0) - (a.lastCompleted?.getTime() ?? 0)),
    pageSize,
  );

  const tableHeaders: Array<DataTableHeader> = useMemo(
    () => [
      {
        key: 'lastCompleted',
        header: t('lastCompleted', 'Last Completed'),
      },
      { key: 'formName', header: t('formName', 'Form Name (A-Z)') },
    ],
    [t],
  );

  const tableRows: Array<DataTableRow> = useMemo(
    () =>
      results?.map((formInfo) => {
        return {
          id: formInfo.form.uuid,
          lastCompleted: formInfo.lastCompleted ? formatDatetime(formInfo.lastCompleted) : undefined,
          formName: formInfo.form.display ?? formInfo.form.name,
          formUuid: formInfo.form.uuid,
          encounterUuid: formInfo?.associatedEncounters[0]?.uuid,
        };
      }),
    [results],
  );

  const handleFilter = ({ rowIds, headers, cellsById, inputValue, getCellId }: FilterProps): Array<string> => {
    return rowIds.filter((rowId) =>
      headers.some(({ key }) => {
        const cellId = getCellId(rowId, key);
        const filterableValue = cellsById[cellId].value;
        const filterTerm = inputValue.toLowerCase();

        return ('' + filterableValue).toLowerCase().includes(filterTerm);
      }),
    );
  };

  if (!forms?.length) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <EmptyDataIllustration />
          <p className={styles.content}>
            {t('noMatchingFormsAvailable', 'There are no {formCategory} forms to display', {
              formCategory: category?.toLowerCase(),
            })}
          </p>
          <p className={styles.helper}>{t('formSearchHint', 'Try using an alternative name or keyword')}</p>
        </Tile>
      </Layer>
    );
  }

  return (
    <div className={styles.formContainer}>
      {forms?.length > 0 && (
        <>
          <DataTable
            filterRows={handleFilter}
            headers={tableHeaders}
            rows={tableRows}
            size="sm"
            isSortable
            useZebraStyles
          >
            {({ rows, headers, getHeaderProps, getTableProps, onInputChange }) => (
              <TableContainer className={styles.tableContainer}>
                <TableToolbar className={styles.tableToolbar}>
                  <TableToolbarContent>
                    <TableToolbarSearch
                      className={styles.searchInput}
                      expanded
                      light
                      onChange={onInputChange}
                      placeholder={t('searchThisList', 'Search this list')}
                    />
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()} className={styles.table}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          className={`${styles.heading} ${styles.text02}`}
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                        >
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => {
                      return (
                        <TableRow key={row.id}>
                          <TableCell>{row.cells[0].value ?? t('never', 'Never')}</TableCell>
                          <TableCell>
                            <div className={styles.tableCell}>
                              <label
                                onClick={() =>
                                  launchFormEntryOrHtmlForms(
                                    currentVisit,
                                    row.id,
                                    patient,
                                    htmlFormEntryForms,
                                    '',
                                    results[index].form.display ?? results[index].form.name,
                                  )
                                }
                                role="presentation"
                                className={styles.formName}
                              >
                                {row.cells[1].value}
                              </label>
                              {row.cells[0].value && (
                                <Edit
                                  size={20}
                                  description="Edit form"
                                  onClick={() =>
                                    launchFormEntryOrHtmlForms(
                                      currentVisit,
                                      row.id,
                                      patient,
                                      htmlFormEntryForms,
                                      first(results[index].associatedEncounters)?.uuid,
                                      results[index].form.display ?? results[index].form.name,
                                    )
                                  }
                                />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {rows.length === 0 ? (
                  <div className={styles.tileContainer}>
                    <Tile className={styles.tile}>
                      <div className={styles.tileContent}>
                        <p className={styles.content}>
                          {t('noMatchingFormsToDisplay', 'No matching forms to display')}
                        </p>
                      </div>
                    </Tile>
                  </div>
                ) : null}
              </TableContainer>
            )}
          </DataTable>
          <PatientChartPagination
            pageNumber={currentPage}
            totalItems={forms?.length}
            currentItems={results.length}
            pageSize={pageSize}
            onPageNumberChange={({ page }) => goTo(page)}
            dashboardLinkUrl={pageUrl}
            dashboardLinkLabel={urlLabel}
          />
        </>
      )}
    </div>
  );
};

export default FormView;
