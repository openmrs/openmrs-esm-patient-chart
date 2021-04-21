import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { of } from "rxjs/internal/observable/of";
import AllergiesOverview from "./allergies-overview.component";
import { performPatientAllergySearch } from "./allergy-intolerance.resource";
import { mockPatientAllergies } from "../../__mocks__/allergies.mock";

const mockPerformPatientAllergySearch = performPatientAllergySearch as jest.Mock;

const renderAllergiesOverview = () => {
  render(
    <BrowserRouter>
      <AllergiesOverview basePath="/" />
    </BrowserRouter>
  );
};

jest.mock("./allergy-intolerance.resource", () => ({
  performPatientAllergySearch: jest.fn(),
}));

jest.mock("../shared-utils", () => ({
  capitalize: jest
    .fn()
    .mockImplementation((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  openWorkspaceTab: jest.fn(),
}));

describe("<AllergiesOverview />", () => {
  beforeEach(() => {
    mockPerformPatientAllergySearch.mockReset;
  });

  it("should display the patient's allergic reactions and their manifestations", async () => {
    mockPerformPatientAllergySearch.mockReturnValue(of(mockPatientAllergies));

    renderAllergiesOverview();

    await screen.findByText("Allergies");

    expect(screen.getByText("Allergies")).toBeInTheDocument();
    expect(screen.getByText("Cephalosporins")).toBeInTheDocument();
    expect(screen.getByText("Angioedema (Severe)")).toBeInTheDocument();
    expect(screen.getByText("Peanuts")).toBeInTheDocument();
    expect(screen.getByText("Anaphylaxis (Mild)")).toBeInTheDocument();
    expect(screen.getByText("ACE inhibitors")).toBeInTheDocument();
    expect(
      screen.getByText("Angioedema, Anaphylaxis (Severe)")
    ).toBeInTheDocument();
  });

  it("renders an empty state view when allergies are absent", async () => {
    mockPerformPatientAllergySearch.mockReturnValue(of([]));

    renderAllergiesOverview();

    await screen.findByText(/Allergies/i);

    expect(screen.getByText(/Allergies/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        "There are no allergy intolerances to display for this patient"
      )
    ).toBeInTheDocument();
  });
});
