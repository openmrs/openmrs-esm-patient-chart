import React from "react";
import VitalsOverview from "./vitals-overview.component";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { of } from "rxjs/internal/observable/of";
import { mockVitalData } from "../../../../__mocks__/vitals.mock";
import { performPatientsVitalsSearch } from "./vitals-biometrics.resource";

const mockPerformPatientVitalsSearch = performPatientsVitalsSearch as jest.Mock;
const mockVitalsConfig = {
  vitals: {
    bloodPressureUnit: "mmHg",
    oxygenSaturationUnit: "%",
    pulseUnit: "bpm",
    temperatureUnit: "°C",
  },
};

const renderVitalsOverview = () =>
  render(
    <BrowserRouter>
      <VitalsOverview config={mockVitalsConfig} />
    </BrowserRouter>
  );

jest.mock("./vitals-biometrics.resource", () => ({
  performPatientsVitalsSearch: jest.fn(),
}));

// TO DO Write test for carbon intergration
describe("<VitalsOverview />", () => {
  beforeEach(() => {
    mockPerformPatientVitalsSearch.mockReset;
  });

  it("should display an overview of the patient's vitals data", async () => {
    mockPerformPatientVitalsSearch.mockReturnValue(of(mockVitalData));

    renderVitalsOverview();

    await screen.findByRole("heading", { name: "Vitals" });
    // Extra vitals loaded
    await screen.findByText("See all");
  });

  it("renders an empty state view when vitals data is absent", async () => {
    mockPerformPatientVitalsSearch.mockReturnValue(of([]));

    renderVitalsOverview();

    await screen.findByRole("heading", { name: "Vitals" });
    expect(screen.getByText("Vitals")).toBeInTheDocument();
  });
});
