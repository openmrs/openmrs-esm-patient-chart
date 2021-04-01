import React from "react";
import ImmunizationsOverview from "./immunizations-overview.component";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { performPatientImmunizationsSearch } from "./immunizations.resource";
import { mockPatientImmunizationsSearchResponse } from "../../__mocks__/immunizations.mock";

const mockPerformPatientImmunizationsSearch = performPatientImmunizationsSearch as jest.Mock;

const renderImmunizationsOverview = () => {
  render(
    <BrowserRouter>
      <ImmunizationsOverview basePath="/" />
    </BrowserRouter>
  );
};

jest.mock("./immunizations.resource", () => ({
  performPatientImmunizationsSearch: jest.fn()
}));

describe("<ImmunizationsOverview />", () => {
  it("should display the patient immunizations along with recent vaccination date ", async () => {
    mockPerformPatientImmunizationsSearch.mockResolvedValue(
      mockPatientImmunizationsSearchResponse
    );

    renderImmunizationsOverview();

    await screen.findByText("Influenza");
  });
});
