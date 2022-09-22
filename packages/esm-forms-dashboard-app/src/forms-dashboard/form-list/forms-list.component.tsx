import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './forms-list.scss';
import isEmpty from 'lodash-es/isEmpty';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useConfig, usePagination, Visit, formatDatetime } from '@openmrs/esm-framework';
import {
  DataTable,
  DataTableRow,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
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
  const { htmlFormEntryForms } = useConfig() as ConfigObject;
  const [formInfo, setFormInfo] = useState<Array<CompletedFormInfo>>(formsSection.completedFromsInfo);
  const { results, goTo, currentPage } = usePagination(formInfo, pageSize);
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
    },
  ];

  useEffect(() => {
    const entriesToDisplay = isEmpty(searchTerm)
      ? formInfo
      : formInfo.filter((formInfo) => {
          return formInfo.form.name.toLowerCase().search(searchTerm?.toLowerCase()) !== -1;
        });
    setFormInfo(entriesToDisplay);
  }, [searchTerm, formInfo]);

  const getHtmlFormConfig = (formUuid: string): HtmlFormEntryForm => {
    return htmlFormEntryForms?.find((formConfig) => {
      return formConfig.formUuid == formUuid;
    });
  };

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
    <div className={styles.formsListContainer}>
      <CardHeader title={t(formsSection.labelCode, formsSection.name)} children={undefined} />
      <div className={styles.container}>
        <DataTable rows={tableRows} headers={headers}>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
            <Table {...getTableProps()} useZebraStyles={true}>
              <TableHead>
                <TableRow>
                  {headers.map((header, i) => (
                    <TableHeader key={i} {...getHeaderProps({ header })}>
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
                          let encounterUuid = results[i].associatedEncounters
                            ? results[i].associatedEncounters[0]?.uuid
                            : undefined;
                          let fromUuid = results[i].form.uuid;
                          launchFormEntryOrHtmlForms(
                            visit,
                            fromUuid,
                            patient,
                            htmlFormEntryForms,
                            encounterUuid,
                            results[i].form.display ?? results[i].form.name,
                          );
                        }}
                        role="presentation"
                        className={styles.formName}
                      >
                        {results[i].form.display ?? results[i].form.name}
                      </Link>
                    </TableCell>
                    <TableCell key={row.cells[1].id}>{row.cells[1].value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>
        {pageSize != defaultPaginationSize && (
          <PatientChartPagination
            pageNumber={currentPage}
            totalItems={formInfo.length}
            currentItems={results.length}
            pageSize={pageSize}
            onPageNumberChange={({ page }) => goTo(page)}
          />
        )}
      </div>
    </div>
  );
};

export default FormsList;
