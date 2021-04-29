import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { of } from "rxjs/internal/observable/of";
import { mockVitalData } from "../../../../__mocks__/vitals.mock";
import { performPatientsVitalsSearch } from "./vitals-biometrics.resource";
import VitalsOverview from "./vitals-overview.component";

const mockPerformPatientVitalsSearch = performPatientsVitalsSearch as jest.Mock;

jest.mock("./vitals-biometrics.resource", () => ({
  performPatientsVitalsSearch: jest.fn(),
}));

jest.mock("./vitals-biometrics-form/use-vitalsigns", () => ({
  ...jest.requireActual("./vitals-biometrics-form/use-vitalsigns"),
  useVitalsSignsConceptMetaData: jest.fn().mockReturnValue({
    conceptsUnits: [
      "mmHg",
      "mmHg",
      "°C",
      "cm",
      "kg",
      "beats/min",
      "%",
      "cm",
      null,
    ],
  }),
}));

const renderVitalsOverview = () =>
  render(
    <BrowserRouter>
      <VitalsOverview patientUuid="test-patient-uuid" />
    </BrowserRouter>
  );

describe("<VitalsOverview />", () => {
  it("renders an overview of the patient's vitals", async () => {
    mockPerformPatientVitalsSearch.mockReturnValue(of(mockVitalData));
    await renderVitalsOverview();

    screen.findByRole("heading", { name: "Vitals" });
    expect(
      screen.getByRole("button", { name: /table view/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /chart view/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /date/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /bp \(mmhg\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /rate/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /pulse \(beats\/min\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /spo2 \(%\)/i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("row").length).toEqual(6);
  });

  it("can toggle between table view and chart view", async () => {
    mockPerformPatientVitalsSearch.mockReturnValue(of(mockVitalData));
    await renderVitalsOverview();

    const chartViewButton = screen.getByRole("button", {
      name: /chart view/i,
    });
    userEvent.click(chartViewButton);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText(/Vital Sign Displayed/)).toBeInTheDocument();
    expect(screen.getAllByRole("radio").length).toEqual(5);
    expect(screen.getByRole("radio", { name: /bp \(mmHg\)/i })).toBeChecked();

    const tableViewButton = screen.getByRole("button", {
      name: /table view/i,
    });
    userEvent.click(tableViewButton);

    expect(screen.queryByText(/Vital Sign Displayed/)).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders an empty state view when vitals data is absent", async () => {
    mockPerformPatientVitalsSearch.mockReturnValue(of([]));
    await renderVitalsOverview();

    expect(
      screen.queryByRole("heading", { name: "Vitals" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("columnheader")).not.toBeInTheDocument();
    expect(screen.queryByRole("row")).not.toBeInTheDocument();
    expect(
      screen.getByText(/There are no vital signs to display for this patient/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Record vital signs/i)).toBeInTheDocument();
  });
});
