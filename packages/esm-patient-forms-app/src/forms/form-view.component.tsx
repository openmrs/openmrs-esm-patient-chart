import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import isEmpty from 'lodash-es/isEmpty';
import first from 'lodash-es/first';
import debounce from 'lodash-es/debounce';
import {
  DataTable,
  Search,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  DataTableHeader,
  DataTableRow,
} from '@carbon/react';
import { PatientChartPagination, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { formatDatetime, useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { Edit } from '@carbon/react/icons';
import EmptyFormView from './empty-form.component';
import { ConfigObject } from '../config-schema';
import { CompletedFormInfo } from '../types';
import { launchFormEntryOrHtmlForms } from '../form-entry-interop';
import styles from './form-view.scss';

interface FormViewProps {
  forms: Array<CompletedFormInfo>;
  patientUuid: string;
  patient: fhir.Patient;
  pageSize: number;
  pageUrl: string;
  urlLabel: string;
}

const FormView: React.FC<FormViewProps> = ({ forms, patientUuid, patient, pageSize, pageUrl, urlLabel }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const htmlFormEntryForms = config.htmlFormEntryForms;
  const isDesktop = useLayoutType() === 'desktop';
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const [searchTerm, setSearchTerm] = useState<string>(null);
  const [allFormInfos, setAllFormInfos] = useState<Array<CompletedFormInfo>>(forms);
  const { results, goTo, currentPage } = usePagination(
    allFormInfos.sort((a, b) => (b.lastCompleted?.getTime() ?? 0) - (a.lastCompleted?.getTime() ?? 0)),
    pageSize,
  );

  const handleSearch = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), []);

  useEffect(() => {
    const entriesToDisplay = isEmpty(searchTerm)
      ? forms
      : forms.filter((formInfo) => formInfo.form.name.toLowerCase().search(searchTerm?.toLowerCase()) !== -1);
    setAllFormInfos(entriesToDisplay);
  }, [searchTerm, forms]);

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

  return (
    <div className={styles.formContainer}>
      <Search
        id="searchInput"
        labelText=""
        className={styles.formSearchInput}
        placeholder={t('searchForForm', 'Search for a form')}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <>
        {searchTerm?.length > 0 && allFormInfos?.length > 0 && (
          <p className={styles.formResultsLabel}>
            {allFormInfos.length} {t('matchesFound', 'match(es) found')}
          </p>
        )}
        {allFormInfos?.length > 0 && (
          <>
            <DataTable size={isDesktop ? 'sm' : 'lg'} rows={tableRows} headers={tableHeaders} isSortable={true}>
              {({ rows, headers, getHeaderProps, getTableProps }) => (
                <TableContainer className={styles.tableContainer}>
                  <Table {...getTableProps()} useZebraStyles>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader
                            className={`${styles.productiveHeading01} ${styles.text02}`}
                            {...getHeaderProps({
                              header,
                              isSortable: header.isSortable,
                            })}
                          >
                            {header.header?.content ?? header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => {
                        return (
                          <TableRow key={row.id}>
                            <TableCell>{row.cells[0].value ?? t('never', 'Never')}</TableCell>
                            <TableCell className={styles.tableCell}>
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
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
            <PatientChartPagination
              pageNumber={currentPage}
              totalItems={allFormInfos.length}
              currentItems={results.length}
              pageSize={pageSize}
              onPageNumberChange={({ page }) => goTo(page)}
              dashboardLinkUrl={pageUrl}
              dashboardLinkLabel={urlLabel}
            />
          </>
        )}
        {isEmpty(allFormInfos) && (
          <EmptyFormView
            action={t('formSearchHint', 'Try searching for the form using an alternative name or keyword')}
          />
        )}
      </>
    </div>
  );
};

export default FormView;
