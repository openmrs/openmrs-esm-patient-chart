import React, { useMemo } from 'react';
import Search from 'carbon-components-react/es/components/Search';
import debounce from 'lodash-es/debounce';
import isEmpty from 'lodash-es/isEmpty';
import styles from './form-view.component.scss';
import { getStartedVisit, VisitItem } from '@openmrs/esm-framework';
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
import { formatDate, sortFormLatestFirst } from './forms-utils';
import EmptyFormView from './empty-form.component';
import PatientChartPagination from '../pagination/pagination.component';
import first from 'lodash-es/first';
import { usePagination } from '@openmrs/esm-patient-common-lib';

function startVisitPrompt() {
  window.dispatchEvent(
    new CustomEvent('visit-dialog', {
      detail: {
        type: 'prompt',
      },
    }),
  );
}

function launchFormEntry(activeVisit: VisitItem, _: Form) {
  if (activeVisit) {
    //TODO launch into patient-chart-workspace-slot using formUuid: form.uuid, encounterUuid: encounterUuid;
  } else {
    startVisitPrompt();
  }
}

interface FormViewProps {
  forms: Array<Form>;
  patientUuid: string;
  encounterUuid?: string;
}

const filterFormsByName = (formName: string, forms: Array<Form>) => {
  return forms.filter((form) => form.name.toLowerCase().search(formName.toLowerCase()) !== -1);
};

const FormView: React.FC<FormViewProps> = ({ forms, patientUuid, encounterUuid }) => {
  const { t } = useTranslation();
  const [activeVisit, setActiveVisit] = React.useState<VisitItem>();
  const [searchTerm, setSearchTerm] = React.useState<string>(null);
  const [allForms, setAllForms] = React.useState<Array<Form>>(forms);
  const { results, goTo, currentPage } = usePagination(allForms.sort(sortFormLatestFirst), 5);

  const handleSearch = React.useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), 300), []);

  React.useEffect(() => {
    setAllForms(!isEmpty(searchTerm) ? filterFormsByName(searchTerm, forms) : forms);
  }, [searchTerm, forms]);

  React.useEffect(() => {
    const sub = getStartedVisit.subscribe((visit) => setActiveVisit(visit));
    return () => sub.unsubscribe();
  }, []);

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
      results.map((form, index) => {
        return {
          id: `${index}`,
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
        {isEmpty(allForms) && !isEmpty(searchTerm) && (
          <EmptyFormView
            action={t('formSearchHint', 'Try searching for the form using an alternative name or keyword')}
          />
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
                        <TableRow key={row.id} onClick={() => launchFormEntry(activeVisit, row.cells[1].value)}>
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
              currentPage={results}
              patientUuid={patientUuid}
              pageSize={5}
              pageUrl=""
              onPageNumberChange={({ page }) => goTo(page)}
              items={allForms}
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
