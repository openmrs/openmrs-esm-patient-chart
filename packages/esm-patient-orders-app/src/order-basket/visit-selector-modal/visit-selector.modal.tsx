import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ButtonSet,
  Button,
  TableContainer,
  TableToolbar,
  TableToolbarSearch,
  TableToolbarContent,
} from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './visit-selector.scss';
// onChange={onInputChange}

export const VisitSelector = ({ closeModal }) => {
  const { t } = useTranslation();

  const handleCreateNewVisit = () => {
    // TODO implement
  };

  return (
    <React.Fragment>
      <ModalHeader closeModal={closeModal} title={t('selectAVisit', 'Select a visit')} subtitle={'shsh'} />
      <ModalBody>
        <DataTable
          headers={[
            {
              header: 'Name',
              key: 'name',
            },
            {
              header: 'Protocol',
              key: 'protocol',
            },
            {
              header: 'Port',
              key: 'port',
            },
            {
              header: 'Rule',
              key: 'rule',
            },
            {
              header: 'Attached groups',
              key: 'attached_groups',
            },
            {
              header: 'Status',
              key: 'status',
            },
          ]}
          rows={[
            {
              attached_groups: 'Kevin’s VM Groups',
              id: 'a',
              name: 'Load Balancer 3',
              port: 3000,
              protocol: 'HTTP',
              rule: 'Round robin',
            },
            {
              attached_groups: 'Maureen’s VM Groups',
              id: 'b',
              name: 'Load Balancer 1',
              port: 443,
              protocol: 'HTTP',
              rule: 'Round robin',
            },
            {
              attached_groups: 'Andrew’s VM Groups',
              id: 'c',
              name: 'Load Balancer 2',
              port: 80,
              protocol: 'HTTP',
              rule: 'DNS delegation',
            },
            {
              attached_groups: 'Marc’s VM Groups',
              id: 'd',
              name: 'Load Balancer 6',
              port: 3000,
              protocol: 'HTTP',
              rule: 'Round robin',
            },
            {
              attached_groups: 'Mel’s VM Groups',
              id: 'e',
              name: 'Load Balancer 4',
              port: 443,
              protocol: 'HTTP',
              rule: 'Round robin',
            },
            {
              attached_groups: 'Ronja’s VM Groups',
              id: 'f',
              name: 'Load Balancer 5',
              port: 80,
              protocol: 'HTTP',
              rule: 'DNS delegation',
            },
          ]}
          size="md"
        >
          {({ rows, getTableProps, getRowProps, getTableContainerProps, getToolbarProps, headers, getHeaderProps }) => (
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      key={header.key}
                      {...getHeaderProps({
                        header,
                      })}
                    >
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>
        <Button kind="ghost" onClick={handleCreateNewVisit}>
          Create new visit...
        </Button>
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button kind="secondary">{t('cancel', 'Cancel')}</Button>
          <Button>{t('continue', 'Continue')}</Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};
