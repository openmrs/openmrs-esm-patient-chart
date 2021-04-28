import React from "react";

import Table16 from "@carbon/icons-react/es/table/16";
import ChartLine16 from "@carbon/icons-react/es/chart--line/16";
import Button from "carbon-components-react/lib/components/Button";
import DataTable from "carbon-components-react/lib/components/DataTable";
import Table from "carbon-components-react/lib/components/DataTable/Table";
import TableContainer from "carbon-components-react/lib/components/DataTable/TableContainer";
import TableHead from "carbon-components-react/lib/components/DataTable/TableHead";
import TableHeader from "carbon-components-react/lib/components/DataTable/TableHeader";
import TableRow from "carbon-components-react/lib/components/DataTable/TableRow";
import TableCell from "carbon-components-react/lib/components/DataTable/TableCell";
import TableBody from "carbon-components-react/lib/components/DataTable/TableBody";
import TableToolbarContent from "carbon-components-react/lib/components/DataTable/TableToolbarContent";
import TableToolbar from "carbon-components-react/lib/components/DataTable/TableToolbar";
import {
  Card,
  headers,
  formatDate,
  InfoButton,
  Separator,
  TypedTableRow,
} from "./helpers";
import { OverviewPanelEntry, OverviewPanelData } from "./useOverviewData";

export const CommonDataTable: React.FC<{
  data: Array<OverviewPanelData>;
  tableHeaders: Array<{
    key: string;
    header: string;
  }>;
  title?: string;
  toolbar?: React.ReactNode;
  description?: React.ReactNode;
}> = ({ title, data, description, toolbar, tableHeaders }) => (
  <DataTable rows={data} headers={tableHeaders}>
    {({
      rows,
      headers,
      getHeaderProps,
      getRowProps,
      getTableProps,
      getTableContainerProps,
    }) => (
      <TableContainer
        title={title}
        description={description}
        {...getTableContainerProps()}
      >
        {toolbar}
        <Table {...getTableProps()} isSortable>
          <colgroup>
            <col span={1} style={{ width: "33%" }} />
            <col span={1} style={{ width: "33%" }} />
            <col span={1} style={{ width: "34%" }} />
          </colgroup>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader
                  key={header.key}
                  {...getHeaderProps({ header })}
                  isSortable
                >
                  {header.header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TypedTableRow
                key={row.id}
                interpretation={data[i].interpretation}
                {...getRowProps({ row })}
              >
                {row.cells.map((cell) => (
                  <TableCell key={cell.id}>{cell.value}</TableCell>
                ))}
              </TypedTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DataTable>
);

interface CommonOverviewProps {
  overviewData: Array<OverviewPanelEntry>;
  insertSeperator?: boolean;
  openTimeline: (panelUuid: string) => void;
  openTrendline: (panelUuid: string, testUuid: string) => void;
}

const CommonOverview: React.FC<CommonOverviewProps> = ({
  overviewData = [],
  insertSeperator = false,
  openTimeline,
  openTrendline,
}) => {
  return (
    <>
      {(() => {
        const cards = overviewData.map(([title, type, data, date, uuid]) => (
          <Card key={uuid}>
            <CommonDataTable
              {...{
                title,
                data,
                tableHeaders: headers,
                description: (
                  <div>
                    {formatDate(date)}
                    <InfoButton />
                  </div>
                ),
                toolbar: (
                  <TableToolbar>
                    <TableToolbarContent>
                      {type === "Test" && (
                        <Button
                          kind="ghost"
                          renderIcon={ChartLine16}
                          onClick={() => openTrendline(uuid, uuid)}
                        >
                          Trend
                        </Button>
                      )}
                      <Button
                        kind="ghost"
                        renderIcon={Table16}
                        onClick={() => openTimeline(uuid)}
                      >
                        Timeline
                      </Button>
                    </TableToolbarContent>
                  </TableToolbar>
                ),
              }}
            />
          </Card>
        ));

        if (insertSeperator)
          return cards.reduce((acc, val, i, { length }) => {
            acc.push(val);

            if (i < length - 1) {
              acc.push(<Separator key={i} />);
            }

            return acc;
          }, []);

        return cards;
      })()}
    </>
  );
};

export default CommonOverview;
