import React from "react";
import { useCurrentPatient } from "@openmrs/esm-api";
import { getEncounterObservableRESTAPI } from "./encounter.resource";
import { cleanup, render, fireEvent } from "@testing-library/react";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { mockPatientEncountersRESTAPI } from "../../../__mocks__/encounters.mock";
import { BrowserRouter } from "react-router-dom";
import NotesSummary from "./notes-summary.component";
import { of } from "rxjs";
import { act } from "react-dom/test-utils";

const mockGetEncounterObservableRESTAPI = getEncounterObservableRESTAPI as jest.Mock;
const mockUseCurrentPatient = useCurrentPatient as jest.Mock;

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

jest.mock("./encounter.resource", () => ({
  getEncounterObservableRESTAPI: jest.fn()
}));

describe("<NoteSummary />", () => {
  let patient: fhir.Patient = mockPatient;
  afterEach(() => {
    jest.resetAllMocks();
    cleanup();
  });

  beforeEach(() => {
    mockUseCurrentPatient.mockReturnValue([false, patient.id, patient, null]);
    mockGetEncounterObservableRESTAPI.mockReturnValue(
      of(mockPatientEncountersRESTAPI)
    );
  });

  it("render without dying", () => {
    const wrapper = render(
      <BrowserRouter>
        <NotesSummary />
      </BrowserRouter>
    );
  });

  it("should display the notes correctly", () => {
    const { getByText } = render(
      <BrowserRouter>
        <NotesSummary />
      </BrowserRouter>
    );
    expect(getByText("Notes")).toBeTruthy();
    expect(getByText("2019 09-Nov")).toBeTruthy();
    expect(getByText("Outpatient Clinic")).toBeTruthy();
    expect(getByText("DAEMON")).toBeTruthy();
    expect(getByText("Page 1 of 3")).toBeTruthy();
  });

  it("should display the pagination controls", () => {
    const { getByText, getByDisplayValue, container } = render(
      <BrowserRouter>
        <NotesSummary />
      </BrowserRouter>
    );

    expect(getByText("Next")).toBeTruthy();
    expect(getByText("Page 1 of 3")).toBeTruthy();
  });

  it("should navigate to next and previous page of results", () => {
    const { getByText } = render(
      <BrowserRouter>
        <NotesSummary />
      </BrowserRouter>
    );

    const nextButton = getByText("Next");

    expect(getByText("Page 1 of 3")).toBeTruthy();
    expect(getByText("Next")).toBeDefined();

    act(() => {
      fireEvent.click(nextButton);
    });

    expect(getByText("Page 2 of 3")).toBeDefined();
    expect(getByText("Previous")).toBeDefined();

    const previousButton = getByText("Previous");
    const pageTwoNextButton = getByText("Next");

    act(() => {
      fireEvent.click(pageTwoNextButton);
    });

    expect(getByText("Page 3 of 3")).toBeTruthy();
    expect(getByText("Previous")).toBeTruthy();

    const pageThreePreviousButton = getByText("Previous");

    act(() => {
      fireEvent.click(pageThreePreviousButton);
    });

    expect(getByText("Page 2 of 3")).toBeTruthy();
    expect(getByText("Previous")).toBeTruthy();
    expect(getByText("Next")).toBeTruthy();
  });
});
