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
import { OverviewPanelEntry } from "./useOverviewData";
import {
  Card,
  headers,
  formatDate,
  InfoButton,
  Separator,
  TypedTableRow,
} from "./helpers";

const testPatient = "8673ee4f-e2ab-4077-ba55-4980f408773e";

interface CommonOverviewProps {
  overviewData: Array<OverviewPanelEntry>;
  patientUuid: string;
  insertSeperator?: boolean;
  openTimeline: (panelUuid: string) => void;
  openTrendline: (panelUuid: string, testUuid: string) => void;
}

const CommonOverview: React.FC<CommonOverviewProps> = ({
  overviewData = [],
  patientUuid,
  insertSeperator = false,
  openTimeline,
  openTrendline,
}) => {
  return (
    <>
      {(() => {
        const cards = overviewData.map(([title, type, data, date, uuid]) => (
          <Card key={uuid}>
            <DataTable rows={data} headers={headers}>
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
                  description={
                    <div>
                      {formatDate(date)}
                      <InfoButton />
                    </div>
                  }
                  {...getTableContainerProps()}
                >
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
