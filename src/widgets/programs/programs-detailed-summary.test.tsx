import React from "react";
import { cleanup, render, wait } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProgramsDetailedSummary from "./programs-detailed-summary.component";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { useCurrentPatient } from "../../../__mocks__/openmrs-esm-api.mock";
import { mockProgramResponse } from "../../../__mocks__/programs.mock";
import { getPatientProgramByUuid } from "./programs.resource";
import { of } from "rxjs/internal/observable/of";

const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockFetchPatientProgram = getPatientProgramByUuid as jest.Mock;

jest.mock("./programs.resource", () => ({
  getPatientProgramByUuid: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

describe("<ProgramsDetailedSummary />", () => {
  let wrapper: any;

  afterEach(cleanup);
  beforeEach(mockFetchPatientProgram.mockReset);
  beforeEach(() => {
    mockUseCurrentPatient.mockReturnValue([
      false,
      mockPatient,
      mockPatient.id,
      null
    ]);
    mockFetchPatientProgram.mockReturnValue(of(mockProgramResponse));
  });

  it("renders without dying", async () => {
    wrapper = render(
      <BrowserRouter>
        <ProgramsDetailedSummary />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });

  it("displays a detailed summary of the selected care program", async () => {
    wrapper = render(
      <BrowserRouter>
        <ProgramsDetailedSummary />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("Program").textContent).toBeTruthy();
      expect(
        wrapper.getByText("HIV Care and Treatment").textContent
      ).toBeTruthy();
      expect(wrapper.getByText("Enrolled on").textContent).toBeTruthy();
      expect(wrapper.getByText("Enrolled at").textContent).toBeTruthy();
      expect(wrapper.getByText("Status").textContent).toBeTruthy();
      expect(wrapper.getByText("01-Nov-2019").textContent).toBeTruthy();
      expect(wrapper.getByText("-").textContent).toBeTruthy();
      expect(wrapper.getByText("Active").textContent).toBeTruthy();
    });
  });
});
