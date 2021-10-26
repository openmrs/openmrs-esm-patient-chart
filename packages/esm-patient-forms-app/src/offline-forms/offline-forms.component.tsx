import { useLayoutType } from '@openmrs/esm-framework';
import {
  DataTable,
  TableContainer,
  Search,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableCustomRenderProps,
  DataTableHeader,
  DataTableRow,
  Toggle,
} from 'carbon-components-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './offline-forms.styles.scss';

const forms = [
  {
    uuid: '1',
    name: 'Offline form 1',
    availableOffline: false,
  },
  {
    uuid: '2',
    name: 'Offline form 2',
    availableOffline: true,
  },
];

const OfflineForms: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const toolbarItemSize = layout === 'desktop' ? 'sm' : undefined;
  const headers: Array<DataTableHeader> = [
    { key: 'formName', header: t('offlineFormsTableFormNameHeader', 'Form name') },
    { key: 'availableOffline', header: t('offlineFormsTableFormAvailableOffline', 'Offline') },
  ];
  const rows: Array<DataTableRow & Record<string, unknown>> = forms.map((offlineFormInfo) => ({
    id: offlineFormInfo.uuid,
    formName: offlineFormInfo.name,
    availableOffline: (
      <div>
        <Toggle
          id={`${offlineFormInfo.uuid}-available-offline-toggle`}
          className={styles.availableOfflineToggle}
          labelA=""
          labelB=""
          size="sm"
        />
      </div>
    ),
  }));

  return (
    <>
      <header className={styles.pageHeaderContainer}>
        <h1 className={styles.pageHeader}>{t('offlineFormsTitle', 'Offline forms')}</h1>
      </header>
      <main className={styles.contentContainer}>
        <DataTable rows={rows} headers={headers}>
          {({
            rows,
            headers,
            getTableProps,
            getHeaderProps,
            getRowProps,
            getTableContainerProps,
            onInputChange,
          }: DataTableCustomRenderProps) => (
            <TableContainer className={styles.tableContainer} {...getTableContainerProps()}>
              <div className={styles.tableHeaderContainer}>
                <Search
                  className={styles.tableSearch}
                  labelText={t('offlinePatientsTableSearchLabel', 'Search this list')}
                  placeholder={t('offlinePatientsTableSearchPlaceholder', 'Search this list')}
                  size={toolbarItemSize}
                  onChange={onInputChange}
                  light
                />
              </div>
              <Table {...getTableProps()} isSortable useZebraStyles>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} isSortable>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.value ?? cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </main>
    </>
  );
};

export default OfflineForms;
