import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './forms-list.scss';
import isEmpty from 'lodash-es/isEmpty';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useConfig, usePagination, Visit, formatDatetime, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { launchFormEntryOrHtmlForms } from '../../form-entry-interop';
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
import { ConfigObject, OrderBy } from '../../config-schema';
import { defaultPaginationSize } from '../../constants';
import { HtmlFormEntryForm } from '@openmrs/esm-patient-forms-app/src/config-schema';

export interface FormsListProps {
  patientUuid: string;
  patient: fhir.Patient;
  visit: Visit;
  formsSection: FormsSection;
  searchTerm: string;
  pageSize: number;
  htmlFormEntryForms: Array<HtmlFormEntryForm>;
}

const FormsList: React.FC<FormsListProps> = ({
  patientUuid,
  patient,
  visit,
  formsSection,
  searchTerm,
  pageSize = defaultPaginationSize,
  htmlFormEntryForms,
}) => {
  const { t } = useTranslation();
  const { orderBy } = useConfig() as ConfigObject;
  const layout = useLayoutType();
  const [formsInfo, setFormsInfo] = useState(formsSection.completedFromsInfo);
  const orderForms = (orderBy: string, formsInfo: Array<CompletedFormInfo>): Array<CompletedFormInfo> => {
    switch (orderBy) {
      case OrderBy.Name:
        return formsInfo.sort((a, b) => (a.form.display < b.form.display ? -1 : 1));
      case OrderBy.MostRecent:
        return formsInfo.sort((a, b) => (b.lastCompleted?.getTime() ?? 0) - (a.lastCompleted?.getTime() ?? 0));
      default:
        return formsInfo;
    }
  };
  const { results, goTo, currentPage } = usePagination(orderForms(orderBy, formsInfo), pageSize);
  const handleFormOpen = useCallback(
    (formUuid, encounterUuid, formName) => {
      launchFormEntryOrHtmlForms(visit, formUuid, patient, htmlFormEntryForms, encounterUuid, formName);
    },
    [htmlFormEntryForms, patient, visit],
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
  }, [formsInfo, searchTerm]);

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

  if (tableRows) {
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
                              handleFormOpen(row.id, null, tableRows[i].formName);
                            }}
                            role="presentation"
                            className={styles.formName}
                          >
                            {tableRows[i]?.formName}
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
