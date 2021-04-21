import React from "react";
import userEvent from "@testing-library/user-event";
import VisitNotesForm from "./visit-notes-form.component";
import { BrowserRouter } from "react-router-dom";
import { screen, render } from "@testing-library/react";
import { of } from "rxjs/internal/observable/of";
import { ConfigMock } from "../../../__mocks__/chart-widgets-config.mock";
import {
  fetchCurrentSessionData,
  fetchDiagnosisByName,
  fetchLocationByUuid,
  fetchProviderByUuid,
  saveVisitNote,
} from "./visit-notes.resource";
import {
  currentSessionResponse,
  diagnosisSearchResponse,
  mockFetchLocationByUuidResponse,
  mockFetchProviderByUuidResponse,
} from "../../../__mocks__/visit-note.mock";
import { mockPatient } from "../../../__mocks__/patient.mock";

const mockFetchCurrentSessionData = fetchCurrentSessionData as jest.Mock;
const mockFetchDiagnosisByName = fetchDiagnosisByName as jest.Mock;
const mockFetchLocationByUuid = fetchLocationByUuid as jest.Mock;
const mockFetchProviderByUuid = fetchProviderByUuid as jest.Mock;
const mockSaveVisitNote = saveVisitNote as jest.Mock;

jest.mock("./visit-notes.resource", () => ({
  fetchCurrentSessionData: jest.fn(),
  fetchDiagnosisByName: jest.fn(),
  fetchLocationByUuid: jest.fn(),
  fetchProviderByUuid: jest.fn(),
  saveVisitNote: jest.fn(),
}));

describe("Visit notes form", () => {
  let mockConfig = ConfigMock;

  beforeEach(() => {
    mockFetchCurrentSessionData.mockResolvedValue(currentSessionResponse);
    mockFetchLocationByUuid.mockResolvedValue(mockFetchLocationByUuidResponse);
    mockFetchProviderByUuid.mockResolvedValue(mockFetchProviderByUuidResponse);
    mockFetchDiagnosisByName.mockReturnValue(
      of(diagnosisSearchResponse.results)
    );
  });

  afterEach(() => {
    mockFetchCurrentSessionData.mockReset();
    mockFetchLocationByUuid.mockReset();
    mockFetchProviderByUuid.mockReset();
    mockFetchDiagnosisByName.mockReset();
  });

  const renderVisitNotesForm = () => {
    render(
      <BrowserRouter>
        <VisitNotesForm config={mockConfig} />
      </BrowserRouter>
    );
  };

  it("renders the visit notes form successfully", async () => {
    renderVisitNotesForm();
    await screen.findByText(/Add a Visit Note/i);

    screen.getByRole("heading", { name: /Add a Visit Note/i });
    screen.getByLabelText("Visit Date");
    screen.getByText("Diagnosis");
    screen.getByRole("searchbox");
    screen.getByRole("button", { name: /Save & Close/i });
    screen.getByRole("button", { name: /Cancel/i });
  });

  it("typing in the diagnosis search input triggers a search", async () => {
    renderVisitNotesForm();

    const searchbox = await screen.findByRole("searchbox");
    userEvent.type(searchbox, "Diabetes Mellitus");
    const targetSearchResult = await screen.findByText(/^Diabetes Mellitus$/);
    expect(targetSearchResult).toBeInTheDocument();
    expect(screen.getByText("Diabetes Mellitus, Type II")).toBeInTheDocument();

    // clicking on a search result displays the selected diagnosis as a tag
    userEvent.click(targetSearchResult);
    await screen.findByTitle("Diabetes Mellitus");
    const diabetesMellitusTag = screen.getByLabelText(
      "Clear filter Diabetes Mellitus"
    );
    expect(diabetesMellitusTag).toHaveAttribute(
      "class",
      expect.stringContaining("bx--tag--red")
    ); // primary diagnosis tags have a red background

    const closeTagButton = screen.getByRole("button", {
      name: "Clear filter Diabetes Mellitus",
    });
    // Clicking the close button on the tag removes the selected diagnosis
    userEvent.click(closeTagButton);
    // no selected diagnoses left
    await screen.findByText(/No diagnosis selected — Enter a diagnosis below/i);
  });

  it("displays a message when no matching diagnosis are found", async () => {
    mockFetchDiagnosisByName.mockClear();
    mockFetchDiagnosisByName.mockReturnValue(of([]));
    renderVisitNotesForm();

    const searchbox = await screen.findByRole("searchbox");
    userEvent.type(searchbox, "COVID-21");
    const spanElement = await screen.findByText(
      "No matching diagnoses have been found"
    );
    expect(spanElement).toBeInTheDocument();
  });

  it("clicking 'Save & Close' submits the form ", async () => {
    const testPayload = {
      encounterProviders: jasmine.arrayContaining([
        {
          encounterRole: mockConfig.visitNoteConfig.clinicianEncounterRole,
          provider: mockFetchProviderByUuidResponse.data.uuid,
        },
      ]),
      encounterType: mockConfig.visitNoteConfig.encounterTypeUuid,
      form: mockConfig.visitNoteConfig.formConceptUuid,
      location: mockFetchLocationByUuidResponse.data.uuid,
      obs: jasmine.arrayContaining([
        {
          concept: mockConfig.visitNoteConfig.encounterNoteConceptUuid,
          value: "Sample clinical note",
        },
        undefined,
      ]),
      patient: mockPatient.id,
    };

    mockSaveVisitNote.mockResolvedValue(testPayload);
    renderVisitNotesForm();

    const searchbox = await screen.findByRole("searchbox");
    userEvent.type(searchbox, "Diabetes Mellitus");
    const targetSearchResult = await screen.findByText(/^Diabetes Mellitus$/);
    expect(targetSearchResult).toBeInTheDocument();
    userEvent.click(targetSearchResult);

    const clinicalNote = await screen.findByRole("textbox", { name: "" });
    userEvent.clear(clinicalNote);
    userEvent.type(clinicalNote, "Sample clinical note");
    expect(clinicalNote).toHaveValue("Sample clinical note");
    const submitBtn = screen.getByRole("button", { name: /Save & Close/i });
    userEvent.click(submitBtn);
    expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
    expect(mockSaveVisitNote).toHaveBeenCalledWith(
      new AbortController(),
      jasmine.objectContaining(testPayload)
    );
  });
});
