import React, { useMemo } from 'react';
import Search from 'carbon-components-react/es/components/Search';
import debounce from 'lodash-es/debounce';
import isEmpty from 'lodash-es/isEmpty';
import styles from './form-view.component.scss';
import { attach, navigate, usePagination, useVisit, Visit } from '@openmrs/esm-framework';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { Form } from '../types';
import DataTable, {
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
} from 'carbon-components-react/es/components/DataTable';
import { formatDate, formEntrySub, sortFormLatestFirst } from './forms-utils';
import EmptyFormView from './empty-form.component';
import first from 'lodash-es/first';
import { CoreHTMLForms } from '../core-html-forms';

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
    const htmlForm = isHTMLForm(formUuid);
    isEmpty(htmlForm)
      ? launchWorkSpace(formUuid, patient, currentVisit?.uuid)
      : navigate({
          to: `\${openmrsBase}/htmlformentryui/htmlform/${htmlForm.UIPage}.page?patientId=${patient.id}&definitionUiResource=referenceapplication:htmlforms/${htmlForm.formAppUrl}.xml`,
        });
  } else {
    startVisitPrompt();
  }
}

const launchWorkSpace = (formUuid: string, patient: fhir.Patient, visitUuid?: string) => {
  formEntrySub.next({ formUuid, patient, visitUuid });
  attach('patient-chart-workspace-slot', 'patient-form-entry-workspace');
};

function isHTMLForm(formUuid: string) {
  const htmlForms = CoreHTMLForms;
  return htmlForms.find((form) => form.formUuid === formUuid);
}

interface FormViewProps {
  forms: Array<Form>;
  patientUuid: string;
  patient: fhir.Patient;
  encounterUuid?: string;
}

const filterFormsByName = (formName: string, forms: Array<Form>) => {
  return forms.filter((form) => form.name.toLowerCase().search(formName.toLowerCase()) !== -1);
};

const FormView: React.FC<FormViewProps> = ({ forms, patientUuid, patient }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const [searchTerm, setSearchTerm] = React.useState<string>(null);
  const [allForms, setAllForms] = React.useState<Array<Form>>(forms);
  const { results, goTo, currentPage } = usePagination(allForms.sort(sortFormLatestFirst), 5);

  const handleSearch = React.useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), []);

  React.useEffect(() => {
    setAllForms(!isEmpty(searchTerm) ? filterFormsByName(searchTerm, forms) : forms);
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
      results.map((form) => {
        return {
          id: form.uuid,
          lastCompleted: form.lastCompleted && formatDate(form.lastCompleted),
          formName: form.name,
          formUuid: form.uuid,
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
        onChange={(evnt) => handleSearch(evnt.target.value)}
      />
      <>
        {!isEmpty(searchTerm) && !isEmpty(allForms) && (
          <p className={styles.formResultsLabel}>
            {allForms.length} {t('matchFound', 'match found')}
          </p>
        )}
        {!isEmpty(allForms) && (
          <>
            <TableContainer className={styles.tableContainer}>
              <DataTable rows={tableRows} headers={tableHeaders} isSortable={true} size="short">
                {({ rows, headers, getHeaderProps, getTableProps }) => (
                  <Table {...getTableProps()}>
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
              totalItems={allForms.length}
              currentItems={results.length}
              pageUrl={`$\{openmrsSpaBase}/patient/${patientUuid}/chart/`}
              pageSize={5}
              onPageNumberChange={({ page }) => goTo(page)}
            />
          </>
        )}
        {isEmpty(allForms) && (
          <EmptyFormView
            action={t('formSearchHint', 'Try searching for the form using an alternative name or keyword')}
          />
        )}
      </>
    </div>
  );
};

export default FormView;
