import React from "react";
import dayjs from "dayjs";
import styles from "./vitals-chart.component.scss";
import RadioButton from "carbon-components-react/es/components/RadioButton";
import RadioButtonGroup from "carbon-components-react/es/components/RadioButtonGroup";
import { PatientVitals } from "./vitals-biometrics.resource";
import { LineChart } from "@carbon/charts-react";
import { LineChartOptions } from "@carbon/charts/interfaces/charts";
import { ScaleTypes } from "@carbon/charts/interfaces/enums";
import "@carbon/charts/styles.css";

interface vitalsChartData {
  title: string;
  value: number | string;
}

interface VitalsChartProps {
  patientVitals: Array<PatientVitals>;
  conceptsUnits: Array<string>;
}

const VitalsChart: React.FC<VitalsChartProps> = ({
  patientVitals,
  conceptsUnits,
}) => {
  const [chartData, setChartData] = React.useState([]);
  const [
    bloodPressureUnit,
    ,
    temperatureUnit,
    ,
    ,
    pulseUnit,
    oxygenSaturationUnit,
    ,
    respiratoryRateUnit,
  ] = conceptsUnits;
  const [
    selectedVitalSign,
    setSelecteVitalsSign,
  ] = React.useState<vitalsChartData>({
    title: `BP (${bloodPressureUnit})`,
    value: "systolic",
  });

  React.useEffect(() => {
    const chartData = patientVitals.map((vitals) => {
      return vitals[selectedVitalSign.value]
        ? {
            group: "vitalsChartData",
            key: dayjs(vitals.date).format("DD-MMM"),
            value: vitals[selectedVitalSign.value],
          }
        : {};
    });
    setChartData(chartData);
  }, [patientVitals, selectedVitalSign]);

  const chartColors = {
    "Blood Pressure": "#6929c4",
    "Oxygen Saturation": "#6929c4",
    Temperature: "#6929c4",
    "Respiratory Rate": "#6929c4",
    Pulse: "#6929c4",
  };

  const chartOptions: LineChartOptions = {
    axes: {
      bottom: {
        title: "Date",
        mapsTo: "key",
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        mapsTo: "value",
        title: selectedVitalSign.title,
        scaleType: ScaleTypes.LINEAR,
        includeZero: false,
      },
    },
    legend: {
      enabled: false,
    },
    color: {
      scale: chartColors,
    },
  };

  const vitalSigns = [
    {
      id: "bloodPressure",
      title: `BP (${bloodPressureUnit})`,
      value: "systolic",
    },
    {
      id: "oxygenSaturation",
      title: `SPO2 (${oxygenSaturationUnit})`,
      value: "oxygenSaturation",
    },
    {
      id: "temperature",
      title: `Temp (${temperatureUnit})`,
      value: "temperature",
    },
    {
      id: "Respiratory Rate",
      title: `R.Rate ${respiratoryRateUnit}`,
      value: "respiratoryRate",
    },
    {
      id: "pulse",
      title: `Pulse (${pulseUnit})`,
      value: "pulse",
    },
  ];

  return (
    <div className={styles.vitalsChartContainer}>
      <div className={styles.vitalSignsArea} style={{ flex: 1 }}>
        <label className={styles.vitalsSign} htmlFor="radio-button-group">
          Vital Sign Displayed
        </label>
        <RadioButtonGroup
          defaultSelected="bloodPressure"
          name="radio-button-group"
          valueSelected="systolic"
          orientation="vertical"
          labelPosition="right"
        >
          {vitalSigns.map(({ id, title, value }) => (
            <RadioButton
              key={id}
              id={id}
              labelText={title}
              value={value}
              className={styles.vitalsSignsRadioButton}
              onClick={() =>
                setSelecteVitalsSign({
                  title: title,
                  value: value,
                })
              }
            />
          ))}
        </RadioButtonGroup>
      </div>
      <div className={styles.vitalsChartArea} style={{ flex: 4 }}>
        <LineChart data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default VitalsChart;
