import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { of } from "rxjs/internal/observable/of";

import { mockEnrolledProgramsResponse } from "../../../__mocks__/programs.mock";

import { fetchEnrolledPrograms } from "./programs.resource";
import { openWorkspaceTab } from "../shared-utils";
import ProgramsForm from "./programs-form.component";
import ProgramsDetailedSummary from "./programs-detailed-summary.component";

const mockFetchEnrolledPrograms = fetchEnrolledPrograms as jest.Mock;
const mockOpenWorkspaceTab = openWorkspaceTab as jest.Mock;

const renderProgramsDetailedSummary = () =>
  render(
    <BrowserRouter>
      <ProgramsDetailedSummary />
    </BrowserRouter>
  );

jest.mock("./programs.resource", () => ({
  fetchEnrolledPrograms: jest.fn()
}));

jest.mock("../shared-utils", () => ({
  openWorkspaceTab: jest.fn()
}));

describe("<ProgramsDetailedSummary />", () => {
  beforeEach(() => {
    mockFetchEnrolledPrograms.mockReset;
    mockOpenWorkspaceTab.mockReset;
  });

  it("displays a detailed summary of the patient's program enrollments", async () => {
    mockFetchEnrolledPrograms.mockReturnValue(of(mockEnrolledProgramsResponse));

    renderProgramsDetailedSummary();

    await screen.findByRole("heading", { name: /Care Programs/i });
    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();

    expect(screen.getByText("Active Programs")).toBeInTheDocument();
    expect(screen.getByText("Since")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("HIV Care and Treatment")).toBeInTheDocument();
    expect(screen.getByText("Jan-2020")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders an empty state view when program enrollment data is absent", async () => {
    mockFetchEnrolledPrograms.mockReturnValue(of({}));

    renderProgramsDetailedSummary();

    await screen.findByRole("heading", { name: /Care Programs/i });
    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();

    expect(
      screen.getByText(
        /There are no program enrollments to display for this patient/
      )
    ).toBeInTheDocument();
  });
});
