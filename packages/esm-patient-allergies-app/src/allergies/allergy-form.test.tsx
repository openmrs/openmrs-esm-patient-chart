import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { match, useRouteMatch, BrowserRouter } from "react-router-dom";
import { of } from "rxjs/internal/observable/of";
import {
  mockAllergyResult,
  mockAllergicReactions,
  mockEnvironmentalAllergens,
  mockSaveAllergyResponse,
  mockUpdatedAllergyResult
} from "../../../__mocks__/allergies.mock";
import {
  deletePatientAllergy,
  getAllergicReactions,
  getPatientAllergyByPatientUuid,
  getAllergyAllergenByConceptUuid,
  savePatientAllergy,
  updatePatientAllergy
} from "./allergy-intolerance.resource";
import AllergyForm from "./allergy-form.component";
import { mockPatient } from "../../../__mocks__/patient.mock";

let testMatch: match = { params: {}, isExact: false, path: "/", url: "/" };
const mockDeletePatientAllergy = deletePatientAllergy as jest.Mock;
const mockGetPatientAllergyByPatientUuid = getPatientAllergyByPatientUuid as jest.Mock;
const mockGetAllergicReactions = getAllergicReactions as jest.Mock;
const mockGetAllergyAllergenByConceptUuid = getAllergyAllergenByConceptUuid as jest.Mock;
const mockSavePatientAllergy = savePatientAllergy as jest.Mock;
const mockUpdatePatientAllergy = updatePatientAllergy as jest.Mock;
const mockUseRouteMatch = useRouteMatch as jest.Mock;
const mockPatientId = mockPatient.id;

const renderAllergyForm = () => {
  render(
    <BrowserRouter>
      <AllergyForm match={testMatch} />
    </BrowserRouter>
  );
};

jest.mock("./allergy-intolerance.resource", () => ({
  deletePatientAllergy: jest.fn(),
  getAllergicReactions: jest.fn(),
  getAllergyAllergenByConceptUuid: jest.fn(),
  getPatientAllergyByPatientUuid: jest.fn(),
  savePatientAllergy: jest.fn(),
  updatePatientAllergy: jest.fn()
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRouteMatch: jest.fn()
}));

describe("<AllergyForm />", () => {
  afterEach(() => jest.restoreAllMocks());

  beforeEach(() => {
    mockUseRouteMatch.mockReset;
    mockDeletePatientAllergy.mockReset;
    mockGetPatientAllergyByPatientUuid.mockReset;
    mockGetAllergicReactions.mockReset;
    mockGetAllergyAllergenByConceptUuid.mockReset;
    mockUpdatePatientAllergy.mockReset;

    mockGetAllergicReactions.mockReturnValue(
      of(mockAllergicReactions.setMembers)
    );
    mockGetAllergyAllergenByConceptUuid.mockReturnValue(
      of(mockEnvironmentalAllergens)
    );
  });

  it("renders the create allergy form with the appropriate fields and values", async () => {
    mockSavePatientAllergy.mockReturnValue(
      Promise.resolve(mockSaveAllergyResponse)
    );

    renderAllergyForm();

    await screen.findByText("Record a new allergy");

    expect(screen.getByText("Record a new allergy")).toBeInTheDocument();
    expect(screen.getByText("Category of reaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Drug")).toBeInTheDocument();
    expect(screen.getByLabelText("Environmental")).toBeInTheDocument();
    expect(screen.getByLabelText("Food")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Patient has no known allergies")
    ).toBeInTheDocument();

    const environmentalAllergenCheckbox = screen.getByLabelText(
      "Environmental"
    );
    expect(environmentalAllergenCheckbox).not.toBeChecked();
    fireEvent.click(environmentalAllergenCheckbox);
    expect(environmentalAllergenCheckbox).toBeChecked();

    expect(screen.getByText(/Environment allergen/)).toBeInTheDocument();
    expect(screen.getByText("Bee stings")).toBeInTheDocument();
    expect(screen.getByText("Dust")).toBeInTheDocument();
    expect(screen.getByText("Latex")).toBeInTheDocument();
    expect(screen.getByText("Reactions")).toBeInTheDocument();
    expect(screen.getByText("Select all that apply")).toBeInTheDocument();
    expect(screen.getByText("Mental status change")).toBeInTheDocument();
    expect(screen.getByText("Anaemia")).toBeInTheDocument();
    expect(screen.getByText("Anaphylaxis")).toBeInTheDocument();
    expect(screen.getByText("Severity of worst reaction")).toBeInTheDocument();
    expect(screen.getByText("Mild")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText("Severe")).toBeInTheDocument();
    expect(screen.getByText("Date of first onset")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).not.toBeDisabled();
    const submitBtn = screen.getByRole("button", { name: "Sign & Save" });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();

    window.confirm = jest.fn(() => true);
    // clicking Cancel prompts user for confirmation
    fireEvent.click(cancelBtn);

    jest.spyOn(window, "confirm").mockImplementation(() => true);

    expect(window.confirm).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledWith(
      "There is ongoing work, are you sure you want to close this tab?"
    );

    expect(
      screen.getByRole("checkbox", { name: "Mental status change" })
    ).not.toBeChecked();

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Mental status change" })
    );

    expect(
      screen.getByRole("checkbox", { name: "Mental status change" })
    ).toBeChecked();

    // clicking Sign & Save submits the form
    fireEvent.click(submitBtn);

    expect(mockSavePatientAllergy).toHaveBeenCalledTimes(1);
    expect(mockSavePatientAllergy).toHaveBeenCalledWith(
      {
        allergenType: "ENVIRONMENT",
        codedAllergenUuid: null,
        comment: "",
        reactionUuids: [{ uuid: "121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" }],
        severityUuid: null
      },
      mockPatientId,
      new AbortController()
    );
  });

  it("renders the edit allergy form with the relevant form fields prefilled", async () => {
    testMatch = {
      params: {
        allergyUuid: "4ef4abef-57b3-4df0-b5c1-41c763e34965"
      },
      isExact: false,
      path: "/",
      url: "/"
    };
    mockGetPatientAllergyByPatientUuid.mockResolvedValue(
      Promise.resolve(mockAllergyResult)
    );
    mockGetAllergicReactions.mockReturnValue(
      of(mockAllergicReactions.setMembers)
    );
    mockDeletePatientAllergy.mockReturnValue(
      Promise.resolve({
        data: null,
        ok: true,
        redirected: false,
        status: 204,
        statusText: "No Content"
      })
    );
    mockUpdatePatientAllergy.mockReturnValue(
      Promise.resolve(mockUpdatedAllergyResult)
    );

    renderAllergyForm();

    await screen.findByText("Edit existing allergy");

    expect(screen.getByText("Allergen")).toBeInTheDocument();
    expect(
      screen.getByText(/ARBs \(angiotensin II receptor blockers\)/)
    ).toBeInTheDocument();
    expect(screen.getByText("(drug)")).toBeInTheDocument();
    expect(screen.getByText("Reactions")).toBeInTheDocument();
    expect(screen.getByText("Select all that apply")).toBeInTheDocument();
    expect(screen.getByText("Severity of worst reaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Mild")).toBeInTheDocument();
    expect(screen.getByLabelText("Moderate")).toBeInTheDocument();
    expect(screen.getByLabelText("Severe")).toBeInTheDocument();
    expect(screen.getByLabelText("Date of first onset")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByLabelText(/comments/i)).toHaveTextContent(
      "The patient is showing a mild reaction to the above allergens"
    );

    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    const submitBtn = screen.getByRole("button", { name: "Sign & Save" });
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    expect(deleteBtn).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).not.toBeDisabled();

    // modify form so formChanged becomes truthy
    fireEvent.click(screen.getByRole("radio", { name: "Moderate" }));

    window.confirm = jest.fn(() => true);

    // clicking Cancel prompts user for confirmation
    fireEvent.click(cancelBtn);

    jest.spyOn(window, "confirm").mockImplementation(() => true);

    expect(window.confirm).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledWith(
      "There is ongoing work, are you sure you want to close this tab?"
    );

    // Clicking Delete deletes an allergy record
    fireEvent.click(deleteBtn);

    expect(mockDeletePatientAllergy).toHaveBeenCalledTimes(1);
    expect(mockDeletePatientAllergy).toHaveBeenCalledWith(
      mockPatientId,
      { allergyUuid: testMatch.params["allergyUuid"] },
      new AbortController()
    );

    // Clicking Sign & Save publishes an allergy record
    fireEvent.click(submitBtn);

    expect(mockUpdatePatientAllergy).toHaveBeenCalledTimes(1);
    expect(mockUpdatePatientAllergy).toHaveBeenCalledWith(
      {
        allergenType: "DRUG",
        codedAllergenUuid: "921fbd85-fa49-46c3-9ee1-77e093fd10a5",
        severityUuid: "1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        comment:
          "The patient is showing a mild reaction to the above allergens",
        reactionUuids: [
          {
            display: "Mental status change",
            uuid: "121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
          }
        ]
      },
      mockPatientId,
      { allergyUuid: testMatch.params["allergyUuid"] },
      new AbortController()
    );
  });
});
