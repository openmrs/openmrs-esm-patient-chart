import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './forms-list.scss';
import isEmpty from 'lodash-es/isEmpty';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useConfig, usePagination, Visit, formatDatetime, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import {
  Layer,
  Tile,
  DataTable,
  DataTableRow,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { CompletedFormInfo, FormsSection } from '../../types';
import { ConfigObject, HtmlFormEntryForm } from '../../config-schema';
import { defaultPaginationSize } from '../../constants';
import { launchFormEntryOrHtmlForms } from '@openmrs/esm-patient-forms-app/src/form-entry-interop';

export interface FormsListPros {
  patientUuid: string;
  patient: fhir.Patient;
  visit: Visit;
  formsSection: FormsSection;
  searchTerm: string;
  pageSize: number;
}

const FormsList: React.FC<FormsListPros> = ({
  patientUuid,
  patient,
  visit,
  formsSection,
  searchTerm,
  pageSize = defaultPaginationSize,
}: FormsListPros) => {
  const { t } = useTranslation();
  const { htmlFormEntryForms, orderFormsByName } = useConfig() as ConfigObject;
  const layout = useLayoutType();
  const [formsInfo, setFormsInfo] = useState<Array<CompletedFormInfo>>(formsSection.completedFromsInfo);
  const { results, goTo, currentPage } = usePagination(
    orderFormsByName
      ? formsInfo.sort((a, b) => (b.lastCompleted?.getTime() ?? 0) - (a.lastCompleted?.getTime() ?? 0))
      : formsInfo,
    pageSize,
  );
  const handleFormOpen = useCallback(
    (formUuid, encounterUuid, formName) => {
      launchFormEntryOrHtmlForms(visit, formUuid, patient, htmlFormEntryForms, encounterUuid, formName);
    },
    [launchFormEntryOrHtmlForms, visit, patient, htmlFormEntryForms],
  );
  const headers = [
    {
      id: 0,
      header: t('formName', 'Form name (A-Z)'),
      key: 'formName',
    },
    {
      id: 1,
      header: t('lastCompleted', 'Last completed'),
      key: 'lastCompleted',
      maxWidth: '40%',
    },
  ];

  useEffect(() => {
    const entriesToDisplay = isEmpty(searchTerm)
      ? formsInfo
      : formsInfo.filter((formInfo) => {
          return formInfo.form.name.toLowerCase().search(searchTerm?.toLowerCase()) !== -1;
        });
    setFormsInfo(entriesToDisplay);
  }, [searchTerm, formsInfo]);

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

  if (tableRows?.length > 0) {
    return (
      <div className={styles.formsListContainer}>
        <CardHeader title={t(formsSection.labelCode, formsSection.name)} children={undefined} />
        <div className={styles.container}>
          <DataTable size={isDesktop(layout) ? 'sm' : 'lg'} rows={tableRows} headers={headers} isSortable>
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
              <TableContainer className={styles.tableContainer}>
                <Table {...getTableProps()} useZebraStyles={true}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header, i) => (
                        <TableHeader
                          className={`${styles.productiveHeading01} ${styles.text02}`}
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
                    {rows.map((row, i) => (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        <TableCell key={row.cells[0].id}>
                          <Link
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              handleFormOpen(row.id, '', tableRows[i].formName);
                            }}
                            role="presentation"
                            className={styles.formName}
                          >
                            {JSON.stringify(tableRows[i])}
                            {/*{tableRows[i].formName}*/}
                          </Link>
                        </TableCell>
                        <TableCell className={styles.editCell}>
                          <label>{row.cells[1].value ?? t('never', 'Never')}</label>
                          {row.cells[1].value && (
                            <Edit
                              size={20}
                              description="Edit form"
                              onClick={() => {
                                handleFormOpen(row.id, tableRows[i].encounterUuid, tableRows[i].formName);
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
          {pageSize != defaultPaginationSize && (
            <PatientChartPagination
              pageNumber={currentPage}
              totalItems={formsInfo.length}
              currentItems={tableRows.length}
              pageSize={pageSize}
              onPageNumberChange={({ page }) => goTo(page)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <Layer>
      <CardHeader title={t(formsSection.labelCode, formsSection.name)} children={undefined} />
      <Tile className={styles.tile}>
        <p className={styles.content}>{t('noFormsAvailable', 'There are no forms to display')}</p>
      </Tile>
    </Layer>
  );
};

export default FormsList;
