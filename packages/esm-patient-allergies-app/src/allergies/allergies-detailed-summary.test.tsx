import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { of } from "rxjs/internal/observable/of";
import { mockPatientAllergies } from "../../__mocks__/allergies.mock";
import { performPatientAllergySearch } from "./allergy-intolerance.resource";
import AllergiesDetailedSummary from "./allergies-detailed-summary.component";

const mockPerformPatientAllergySearch = performPatientAllergySearch as jest.Mock;

const renderAllergiesDetailedSummary = () =>
  render(
    <BrowserRouter>
      <AllergiesDetailedSummary />
    </BrowserRouter>
  );

jest.mock("./allergy-intolerance.resource", () => ({
  performPatientAllergySearch: jest.fn(),
}));

jest.mock("../shared-utils", () => ({
  openWorkspaceTab: jest.fn(),
}));

describe("AllergiesDetailedSummary />", () => {
  beforeEach(() => {
    mockPerformPatientAllergySearch.mockReset;
  });

  it("should display a detailed summary of the patient's allergy history", async () => {
    mockPerformPatientAllergySearch.mockReturnValue(of(mockPatientAllergies));

    renderAllergiesDetailedSummary();

    await screen.findByText("Allergies");

    expect(screen.getByText("Allergen")).toBeInTheDocument();
    expect(screen.getByText("Severity & Reaction")).toBeInTheDocument();
    expect(screen.getByText("Since")).toBeInTheDocument();
    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.getByText("Cephalosporins")).toBeInTheDocument();
    expect(screen.getByText("Angioedema")).toBeInTheDocument();
    expect(screen.getByText("happened today")).toBeInTheDocument();
    expect(screen.getByText("Peanuts")).toBeInTheDocument();
    expect(screen.getByText("Anaphylaxis")).toBeInTheDocument();
    expect(screen.getByText("ACE inhibitors")).toBeInTheDocument();
    expect(screen.getAllByText("high").length).toEqual(2);
    expect(screen.getAllByText("Severe reaction").length).toEqual(2);
  });

  it("renders an empty state view when allergies are absent", async () => {
    mockPerformPatientAllergySearch.mockReturnValue(of([]));

    renderAllergiesDetailedSummary();

    await screen.findByText("Allergies");

    expect(screen.getByText("Allergies")).toBeInTheDocument();
    expect(
      screen.getByText(
        "There are no allergy intolerances to display for this patient"
      )
    ).toBeInTheDocument();
  });
});
