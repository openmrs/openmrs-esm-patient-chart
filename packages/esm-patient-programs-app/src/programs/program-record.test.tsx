import React from "react";
import ProgramRecord from "./program-record.component";
import ProgramsForm from "./programs-form.component";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { mockProgramResponse } from "../../../__mocks__/programs.mock";
import { getPatientProgramByUuid } from "./programs.resource";
import { openWorkspaceTab } from "../shared-utils";
import { of } from "rxjs/internal/observable/of";

const mockFetchPatientProgram = getPatientProgramByUuid as jest.Mock;
const mockOpenWorkspaceTab = openWorkspaceTab as jest.Mock;

jest.mock("./programs.resource", () => ({
  getPatientProgramByUuid: jest.fn()
}));

jest.mock("../shared-utils", () => ({
  openWorkspaceTab: jest.fn()
}));

describe("<ProgramRecord />", () => {
  beforeEach(() => {
    mockFetchPatientProgram.mockReset;
    mockOpenWorkspaceTab.mockReset;

    mockFetchPatientProgram.mockReturnValue(of(mockProgramResponse));
  });

  afterEach(() => jest.restoreAllMocks());

  it("displays a detailed summary of the selected care program", async () => {
    render(
      <BrowserRouter>
        <ProgramRecord match={{ params: { programUuid: "" } }} />
      </BrowserRouter>
    );

    await screen.findByRole("heading", { name: "Program" });

    expect(screen.getByText("Program")).toBeInTheDocument();
    const editBtn = screen.getByRole("button", { name: "Edit" });
    expect(editBtn).toBeInTheDocument();
    expect(screen.getByText("HIV Care and Treatment")).toBeInTheDocument();
    expect(screen.getByText("Enrolled on")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Enrolled at")).toBeInTheDocument();
    expect(screen.getByText("01-Nov-2019")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();

    // Clicking "Edit" launches edit form in workspace tab
    fireEvent.click(editBtn);
    expect(mockOpenWorkspaceTab).toHaveBeenCalled();
    expect(mockOpenWorkspaceTab).toHaveBeenCalledWith(
      ProgramsForm,
      "Edit Program",
      {
        completionDate: null,
        enrollmentDate: "2019-11-01T15:00:00.000+0000",
        location: undefined,
        program: "HIV Care and Treatment",
        programUuid: "8ba6c08f-66d9-4a18-a233-5f658b1755bf"
      }
    );
  });
});
