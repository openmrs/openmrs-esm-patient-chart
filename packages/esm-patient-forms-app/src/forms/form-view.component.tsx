import React, { useState, useEffect, useMemo } from 'react';
import styles from './form-view.component.scss';
import EmptyFormView from './empty-form.component';
import isEmpty from 'lodash-es/isEmpty';
import first from 'lodash-es/first';
import debounce from 'lodash-es/debounce';
import { navigate, usePagination, useVisit, Visit } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
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
  DataTableCell,
  DataTableHeader,
  DataTableRow,
} from 'carbon-components-react';
import { formEntrySub } from './forms-utils';
import { CoreHTMLForms } from '../core-html-forms';
import { PatientChartPagination, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { CompletedFormInfo } from '../types';
import dayjs from 'dayjs';

function startVisitPrompt() {
  window.dispatchEvent(
    new CustomEvent('visit-dialog', {
      detail: {
        type: 'prompt',
      },
    }),
  );
}

function launchFormEntry(currentVisit: Visit | undefined, formUuid: string, patient: fhir.Patient) {
  if (currentVisit) {
    const htmlForm = findHtmlForm(formUuid);
    if (isEmpty(htmlForm)) {
      launchWorkSpace(formUuid, patient, currentVisit?.uuid);
    } else {
      navigate({
        to: `\${openmrsBase}/htmlformentryui/htmlform/${htmlForm.UIPage}.page?patientId=${patient.id}&definitionUiResource=referenceapplication:htmlforms/${htmlForm.formAppUrl}.xml`,
      });
    }
  } else {
    startVisitPrompt();
  }
}

function launchWorkSpace(formUuid: string, patient: fhir.Patient, visitUuid?: string) {
  formEntrySub.next({ formUuid, patient, visitUuid });
  launchPatientWorkspace('patient-form-entry-workspace');
}

function findHtmlForm(formUuid: string) {
  const htmlForms = CoreHTMLForms;
  return htmlForms.find((form) => form.formUuid === formUuid);
}

function formatDate(strDate: string | Date) {
  const date = dayjs(strDate);
  const today = dayjs(new Date());
  if (date.date() === today.date() && date.month() === today.month() && date.year() === today.year()) {
    return `Today @ ${date.format('HH:mm')}`;
  }
  return date.format('DD - MMM - YYYY @ HH:mm');
}

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
  const { currentVisit } = useVisit(patientUuid);
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
      results.map((formInfo) => {
        return {
          id: formInfo.form.uuid,
          lastCompleted: formInfo.lastCompleted ? formatDate(formInfo.lastCompleted) : undefined,
          formName: formInfo.form.name,
          formUuid: formInfo.form.uuid,
        };
      }),
    [results],
  );

  const withValue = (cell, row) => {
    return (
      <TableCell
        style={{
          color: first<DataTableCell>(row.cells).value ? `#0f62fe` : `#525252`,
        }}
        key={cell.id}>
        {cell.value ? cell.value : `${t('never', 'Never')}`}
      </TableCell>
    );
  };

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
            <TableContainer className={styles.tableContainer}>
              <DataTable rows={tableRows} headers={tableHeaders} isSortable={true} size="short">
                {({ rows, headers, getHeaderProps, getTableProps }) => (
                  <Table {...getTableProps()} useZebraStyles>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader
                            className={`${styles.productiveHeading01} ${styles.text02}`}
                            {...getHeaderProps({
                              header,
                              isSortable: header.isSortable,
                            })}>
                            {header.header?.content ?? header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} onClick={() => launchFormEntry(currentVisit, row.id, patient)}>
                          {row.cells.map((cell) => withValue(cell, row))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </DataTable>
            </TableContainer>
            <PatientChartPagination
              pageNumber={currentPage}
              totalItems={allFormInfos.length}
              currentItems={results.length}
              pageUrl={pageUrl}
              pageSize={pageSize}
              onPageNumberChange={({ page }) => goTo(page)}
              urlLabel={urlLabel}
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
