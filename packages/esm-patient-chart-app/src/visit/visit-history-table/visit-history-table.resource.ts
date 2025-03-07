import { useConfig, type Visit } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type ChartConfig } from '../../config-schema';
import { type VisitTableColumnType } from '../../visit-table-config-schema';
import VisitDateCell from './visit-date-column.component';
import { getVisitDiagnosisCell } from './visit-diagnoses-column.component';
import VisitTypeCell from './visit-type-column.component';

export type VisitHistoryTableColumn = {
  key: string; // MUST be unique for each column in the queue table
  header: string; // header of the column
  CellComponent: React.FC<{ visit: Visit }>;
};

export function useVisitHistoryTableColumns(): VisitHistoryTableColumn[] {
  const {
    visitTables: { columnDefinitions, tableDefinitions },
  } = useConfig<ChartConfig>();
  const { t } = useTranslation();

  const columnIds = tableDefinitions[0].columns; // TODO

  return columnIds.map((columnId) => {
    const customColumnDef = columnDefinitions.find((col) => col.id == columnId);
    const { header, columnType = columnId } = customColumnDef ?? {};
    const customHeader = header ? t(header) : null;

    switch (columnType as VisitTableColumnType) {
      case 'date':
        return {
          key: columnId,
          header: customHeader ?? t('date', 'Date'),
          CellComponent: VisitDateCell,
        };
      case 'visit-type':
        return {
          key: columnId,
          header: customHeader ?? t('visitType', 'Visit type'),
          CellComponent: VisitTypeCell,
        };
      case 'diagnoses':
        return {
          key: columnId,
          header: customHeader ?? t('diagnoses', 'Diagnoses'),
          CellComponent: getVisitDiagnosisCell(customColumnDef?.config),
        };
    }
  });
}
