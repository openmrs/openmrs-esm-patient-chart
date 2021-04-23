import React from "react";
import NoteRecord from "./note-record.component";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { of } from "rxjs/internal/observable/of";
import { fetchEncounterByUuid } from "./encounter.resource";
import {
  mockEncounterResponse,
  mockAlternativeEncounterResponse,
} from "../../../../__mocks__/encounters.mock";

const mockFetchPatientEncounter = fetchEncounterByUuid as jest.Mock;

const renderNoteRecord = () =>
  render(
    <BrowserRouter>
      <NoteRecord match={{ params: { encounterUuid: "123" } }} />
    </BrowserRouter>
  );

jest.mock("./encounter.resource", () => ({
  fetchEncounterByUuid: jest.fn(),
}));

describe("<NoteRecord />", () => {
  beforeEach(mockFetchPatientEncounter.mockReset);

  it("displays a detailed summary of the selected note", async () => {
    mockFetchPatientEncounter.mockReturnValue(of(mockEncounterResponse));

    renderNoteRecord();

    await screen.findByText("Note");

    expect(screen.getByText("Note")).toBeTruthy();
    expect(screen.getByText("Visit Note 28/01/2015")).toBeInTheDocument();
    expect(screen.getByText("Encounter type")).toBeInTheDocument();
    expect(screen.getByText("Encounter date")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Visit Note")).toBeInTheDocument();
    expect(screen.getByText("Unknown Location")).toBeInTheDocument();
    expect(screen.getByText("28-01-2015")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Visit Diagnoses: Presumed diagnosis, Primary, Vitamin A Deficiency with Keratomalacia"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Visit Diagnoses: Other disease of hard tissue of teeth, Secondary, Confirmed diagnosis"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Text of encounter note: Duis aute irure dolor in reprehenderit in voluptat"
      )
    ).toBeInTheDocument();
  });

  it("displays a detailed summary of the selected note", async () => {
    mockFetchPatientEncounter.mockReturnValue(of(mockEncounterResponse));

    renderNoteRecord();

    await screen.findByText("Note");

    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("Visit Note 28/01/2015")).toBeInTheDocument();
    expect(screen.getByText("Encounter type")).toBeInTheDocument();
    expect(screen.getByText("Encounter date")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Visit Note")).toBeInTheDocument();
    expect(screen.getByText("Unknown Location")).toBeInTheDocument();
    expect(screen.getByText("28-01-2015")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Visit Diagnoses: Presumed diagnosis, Primary, Vitamin A Deficiency with Keratomalacia"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Visit Diagnoses: Other disease of hard tissue of teeth, Secondary, Confirmed diagnosis"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Text of encounter note: Duis aute irure dolor in reprehenderit in voluptat"
      )
    ).toBeInTheDocument();
  });

  it("displays the patient note details when present", async () => {
    mockFetchPatientEncounter.mockReturnValue(
      of(mockAlternativeEncounterResponse)
    );

    renderNoteRecord();

    await screen.findByText("Note");

    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Weight (kg): 65.0")).toBeInTheDocument();
    expect(screen.getByText("Height (cm): 180.0")).toBeInTheDocument();
    expect(
      screen.getByText("Systolic blood pressure: 120.0")
    ).toBeInTheDocument();
    expect(screen.getByText("Pulse: 60.0")).toBeInTheDocument();
    expect(
      screen.getByText("Blood oxygen saturation: 92.0")
    ).toBeInTheDocument();
    expect(screen.getByText("Temperature (C): 37.0")).toBeInTheDocument();
    expect(
      screen.getByText("Diastolic blood pressure: 80.0")
    ).toBeInTheDocument();
  });
});
