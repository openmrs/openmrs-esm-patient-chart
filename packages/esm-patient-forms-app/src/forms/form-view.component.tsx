import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
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
import { formatDatetime, useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
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
  const isTablet = useLayoutType() === 'tablet';
  const htmlFormEntryForms = config.htmlFormEntryForms;
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredForms = useMemo(() => {
    if (!searchTerm) {
      return forms;
    }
    return forms.filter((form) => {
      const formName = form.form.display ?? form.form.name;
      return formName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [forms, searchTerm]);

  const handleSearch = React.useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), []);

  const { results, goTo, currentPage } = usePagination(
    filteredForms?.sort((a, b) => (b.lastCompleted?.getTime() ?? 0) - (a.lastCompleted?.getTime() ?? 0)),
    pageSize,
  );

  const tableHeaders: Array<DataTableHeader> = useMemo(
    () => [
      { key: 'formName', header: t('formName', 'Form name (A-Z)') },
      {
        key: 'lastCompleted',
        header: t('lastCompleted', 'Last completed'),
      },
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
          <DataTable headers={tableHeaders} rows={tableRows} size="sm" isSortable useZebraStyles>
            {({ rows, headers, getHeaderProps, getTableProps }) => (
              <TableContainer className={styles.tableContainer}>
                <TableToolbar className={styles.tableToolbar}>
                  <TableToolbarContent>
                    <TableToolbarSearch
                      className={styles.searchInput}
                      expanded
                      light
                      onChange={(event) => handleSearch(event.target.value)}
                      placeholder={t('searchForAForm', 'Search for a form')}
                      size={isTablet ? 'md' : 'sm'}
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
                          <TableCell>
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
                              {row.cells[0].value}
                            </label>
                          </TableCell>
                          <TableCell>
                            <div className={styles.tableCell}>
                              {row.cells[1].value ?? t('never', 'Never')}
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
            totalItems={filteredForms?.length}
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
