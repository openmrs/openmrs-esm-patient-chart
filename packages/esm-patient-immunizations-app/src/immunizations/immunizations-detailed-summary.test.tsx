import React from "react";
import includes from "lodash-es/includes";
import { BrowserRouter } from "react-router-dom";
import { render, wait, within } from "@testing-library/react";
import { openmrsFetch, getConfig } from "@openmrs/esm-framework";
import {
  mockImmunizationConfig,
  mockPatientImmunizationsSearchResponse,
  mockVaccinesConceptSet,
} from "../../../__mocks__/immunizations.mock";
import ImmunizationsDetailedSummary from "./immunizations-detailed-summary.component";

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockGetConfig = getConfig as jest.Mock;

mockOpenmrsFetch.mockImplementation(jest.fn());
mockGetConfig.mockImplementation(jest.fn());

describe("<ImmunizationsDetailedSummary />", () => {
  afterEach(mockGetConfig.mockReset);

  it("should render detailed summary from config and search results", async () => {
    mockOpenmrsFetch.mockImplementation((url) => {
      return includes(url, "concept")
        ? Promise.resolve({ data: mockVaccinesConceptSet })
        : Promise.resolve({ data: mockPatientImmunizationsSearchResponse });
    });

    const { container } = render(
      <BrowserRouter>
        <ImmunizationsDetailedSummary
          immunizationsConfig={mockImmunizationConfig.immunizationsConfig}
        />
      </BrowserRouter>
    );

    await wait(() => {
      const immunizationTable = container.querySelector(".immunizationTable");
      expect(immunizationTable).toBeDefined();
      const rows = immunizationTable.querySelectorAll("tr");

      expect(rows.length).toBe(5);

      expect(within(rows[0]).getByText("Vaccine")).toBeTruthy();
      expect(within(rows[0]).getByText("Recent Vaccination")).toBeTruthy();

      expect(within(rows[1]).getByText("Rotavirus")).toBeTruthy();
      expect(within(rows[2]).getByText("Polio")).toBeTruthy();
      expect(within(rows[3]).getByText("Influenza")).toBeTruthy();
      expect(within(rows[4]).getByText("Adinovirus")).toBeTruthy();
    });
  });

  it("should give link when immunization are not configured", async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: {} });

    const { getByText } = render(
      <BrowserRouter>
        <ImmunizationsDetailedSummary
          immunizationsConfig={mockImmunizationConfig.immunizationsConfig}
        />
      </BrowserRouter>
    );

    await wait(() => {
      expect(getByText("No immunizations are configured.")).toBeTruthy();
    });
  });
});
