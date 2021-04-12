import React from "react";
import dayjs from "dayjs";
import Add16 from "@carbon/icons-react/es/add/16";
import ChartLineSmooth16 from "@carbon/icons-react/es/chart--line-smooth/16";
import Table16 from "@carbon/icons-react/es/table/16";
import Button from "carbon-components-react/es/components/Button";
import DataTableSkeleton from "carbon-components-react/es/components/DataTableSkeleton";
import DataTable, {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "carbon-components-react/es/components/DataTable";
import styles from "./vitals-overview.scss";
import VitalsChart from "./vitals-chart.component";
import EmptyState from "./empty-state/empty-state.component";
import ErrorState from "./error-state/error-state.component";
import { useTranslation } from "react-i18next";
import { useConfig, attach } from "@openmrs/esm-framework";
import { useVitalsSignsConceptMetaData } from "./vitals-biometrics-form/use-vitalsigns";
import {
  performPatientsVitalsSearch,
  PatientVitals,
} from "./vitals-biometrics.resource";

const vitalsToShowCount = 5;

interface RenderVitalsProps {
  headerTitle: string;
  tableRows: Array<{}>;
  vitals: Array<PatientVitals>;
  showAllVitals: boolean;
  toggleShowAllVitals(): void;
}

const RenderVitals: React.FC<RenderVitalsProps> = ({
  headerTitle,
  tableRows,
  vitals,
  showAllVitals,
  toggleShowAllVitals,
}) => {
  const { t } = useTranslation();
  const [chartView, setChartView] = React.useState<boolean>();
  const displayText = t("vitalSigns", "vital signs");
  const { conceptsUnits } = useVitalsSignsConceptMetaData();

  const [
    bloodPressureUnit,
    ,
    temperatureUnit,
    ,
    ,
    pulseUnit,
    oxygenationUnit,
    ,
    respiratoryRateUnit,
  ] = conceptsUnits;

  const tableHeaders = [
    { key: "date", header: "Date", isSortable: true },
    { key: "bloodPressure", header: `BP (${bloodPressureUnit})` },
    { key: "rrate", header: `Rate (${respiratoryRateUnit})` },
    { key: "pulse", header: `Pulse (${pulseUnit})` },
    { key: "spo2", header: `SPO2 (${oxygenationUnit})` },
    {
      key: "temperature",
      header: `Temp (${temperatureUnit})`,
    },
  ];

  const launchVitalsBiometricsForm = React.useCallback(
    () =>
      attach(
        "patient-chart-workspace-slot",
        "patient-vitals-biometrics-form-workspace"
      ),
    []
  );

  if (tableRows.length) {
    return (
      <div className={styles.vitalsWidgetContainer}>
        <div className={styles.vitalsHeaderContainer}>
          <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>
            {headerTitle}
          </h4>
          <div className={styles.toggleButtons}>
            <Button
              className={styles.toggle}
              size="field"
              kind={chartView ? "ghost" : "secondary"}
              hasIconOnly
              renderIcon={Table16}
              iconDescription={t("tableView", "Table View")}
              onClick={() => setChartView(false)}
            />
            <Button
              className={styles.toggle}
              size="field"
              kind={chartView ? "secondary" : "ghost"}
              hasIconOnly
              renderIcon={ChartLineSmooth16}
              iconDescription={t("chartView", "Chart View")}
              onClick={() => setChartView(true)}
            />
          </div>
          <Button
            kind="ghost"
            renderIcon={Add16}
            iconDescription="Add vitals"
            onClick={launchVitalsBiometricsForm}
          >
            {t("add", "Add")}
          </Button>
        </div>
        {chartView ? (
          <VitalsChart patientVitals={vitals} conceptsUnits={conceptsUnits} />
        ) : (
          <TableContainer>
            <DataTable
              rows={tableRows}
              headers={tableHeaders}
              isSortable={true}
              size="short"
            >
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
                          })}
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.value?.content ?? cell.value}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {!showAllVitals && vitals?.length > vitalsToShowCount && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <span
                            style={{
                              display: "inline-block",
                              margin: "0.45rem 0rem",
                            }}
                          >
                            {`${vitalsToShowCount} / ${vitals.length}`}{" "}
                            {t("items", "items")}
                          </span>
                          <Button
                            size="small"
                            kind="ghost"
                            onClick={toggleShowAllVitals}
                          >
                            {t("seeAll", "See all")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </DataTable>
          </TableContainer>
        )}
      </div>
    );
  }
  return (
    <EmptyState
      displayText={displayText}
      headerTitle={headerTitle}
      launchForm={launchVitalsBiometricsForm}
    />
  );
};

interface VitalsOverviewProps {
  patientUuid: string;
}

const VitalsOverview: React.FC<VitalsOverviewProps> = ({ patientUuid }) => {
  const config = useConfig();
  const { t } = useTranslation();
  const [vitals, setVitals] = React.useState<Array<PatientVitals>>(null);
  const [error, setError] = React.useState(null);
  const [showAllVitals, setShowAllVitals] = React.useState(false);
  const headerTitle = t("vitals", "Vitals");

  const toggleShowAllVitals = React.useCallback(
    () => setShowAllVitals((value) => !value),
    []
  );

  React.useEffect(() => {
    if (patientUuid) {
      const subscription = performPatientsVitalsSearch(
        config.concepts,
        patientUuid,
        100
      ).subscribe(setVitals, setError);
      return () => subscription.unsubscribe();
    }
  }, [patientUuid]);

  const tableRows = React.useMemo(
    () =>
      vitals
        ?.slice(0, showAllVitals ? vitals.length : vitalsToShowCount)
        .map((vital, index) => {
          return {
            id: `${index}`,
            date: dayjs(vital.date).format(`DD - MMM - YYYY`),
            bloodPressure: `${vital.systolic ?? "-"} / ${vital.diastolic ??
              "-"}`,
            pulse: vital.pulse,
            spo2: vital.oxygenSaturation,
            temperature: vital.temperature,
            rrate: vital.respiratoryRate,
          };
        }),
    [vitals, showAllVitals]
  );

  return (
    <>
      {tableRows ? (
        <RenderVitals
          headerTitle={headerTitle}
          tableRows={tableRows}
          vitals={vitals}
          showAllVitals={showAllVitals}
          toggleShowAllVitals={toggleShowAllVitals}
        />
      ) : error ? (
        <ErrorState error={error} headerTitle={headerTitle} />
      ) : (
        <DataTableSkeleton rowCount={vitalsToShowCount} />
      )}
    </>
  );
};

export default VitalsOverview;
