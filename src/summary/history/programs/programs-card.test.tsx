import React from "react";
import { cleanup, render, wait } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";
import { performPatientProgramsSearch } from "./programs.resource";
import ConditionsCard from "./programs-card.component";
import { useCurrentPatient } from "@openmrs/esm-api";


jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

jest.mock("./conditions.resource", () => ({
  performPatientProgramsSearch: jest.fn()
}));


let wrapper;


describe("<ConditionsCard />", () => {
  afterEach(() => {
    cleanup;
  });

  beforeEach(mockUseCurrentPatient.mockReset);

  it("should render without dying", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);

    mockPerformPatientConditionsSearch.mockResolvedValue(mockPatientConditions);

    wrapper = render(
      <BrowserRouter>
        <ConditionsCard match={match} />
      </BrowserRouter>
    );
    await wait(() => {
      expect(wrapper).toBeTruthy();
    });
  });

  it("should display the patient conditions correctly", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientConditionsSearch.mockReturnValue(
      Promise.resolve(mockPatientConditions)
    );

    wrapper = render(
      <BrowserRouter>
        <ConditionsCard match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper.getByText("Hypothyroidism")).toBeTruthy();
      expect(wrapper.getByText("Hypertension")).toBeTruthy();
    });
  });
});
