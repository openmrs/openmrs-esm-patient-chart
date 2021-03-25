import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import VitalsOverview from "./vitals-overview.component";
import { of } from "rxjs/internal/observable/of";

import { mockVitalData } from "../../../__mocks__/vitals.mock";
import { openWorkspaceTab } from "../shared-utils";
import { performPatientsVitalsSearch } from "./vitals-biometrics.resource";

const mockOpenWorkspaceTab = openWorkspaceTab as jest.Mock;
const mockPerformPatientVitalsSearch = performPatientsVitalsSearch as jest.Mock;
const mockVitalsConfig = {
  vitals: {
    bloodPressureUnit: "mmHg",
    oxygenSaturationUnit: "%",
    pulseUnit: "bpm",
    temperatureUnit: "°C"
  }
};

const renderVitalsOverview = () =>
  render(
    <BrowserRouter>
      <VitalsOverview config={mockVitalsConfig} />
    </BrowserRouter>
  );

jest.mock("./vitals-biometrics.resource", () => ({
  performPatientsVitalsSearch: jest.fn()
}));

jest.mock("../shared-utils", () => ({
  openWorkspaceTab: jest.fn()
}));
// TO DO Write test for carbon intergration
describe("<VitalsOverview />", () => {
  beforeEach(() => {
    mockOpenWorkspaceTab.mockReset;
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
