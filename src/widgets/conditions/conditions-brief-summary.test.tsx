import React from "react";
import { performPatientConditionSearch } from "./conditions.resource";
import { render, cleanup, wait } from "@testing-library/react";
import { BrowserRouter, match } from "react-router-dom";
import ConditionsBriefSummary from "./conditions-brief-summary.component";
import { useCurrentPatient } from "../../../__mocks__/openmrs-esm-api.mock";
import {
  patient,
  mockPatientConditionResult
} from "../../../__mocks__/conditions.mock";

const mockPerformPatientConditionSearch = performPatientConditionSearch as jest.Mock;
const mockUseCurrentPatient = useCurrentPatient as jest.Mock;

jest.mock("./conditions.resource", () => ({
  performPatientConditionSearch: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

describe("<ConditionsBriefSummary />", () => {
  let match: match = { params: {}, isExact: false, path: "/", url: "/" };
  let wrapper: any;

  afterEach(cleanup);
  beforeEach(mockPerformPatientConditionSearch.mockReset);
  beforeEach(mockUseCurrentPatient.mockReset);

  it("renders without dying", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientConditionSearch.mockReturnValue(
      Promise.resolve(mockPatientConditionResult)
    );
    wrapper = render(
      <BrowserRouter>
        <ConditionsBriefSummary match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });

  it("should display the patient's conditions correctly", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientConditionSearch.mockReturnValue(
      Promise.resolve(mockPatientConditionResult)
    );
    wrapper = render(
      <BrowserRouter>
        <ConditionsBriefSummary match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper.toBeDefined);
      expect(wrapper.getByText("Renal rejection").textContent).toBeTruthy();
      expect(wrapper.getByText("Overweight").textContent).toBeTruthy();
      expect(wrapper.getByText("Fever").textContent).toBeTruthy();
      expect(wrapper.getByText("Hypertension").textContent).toBeTruthy();
    });
  });

  it("should not display the patients conditions when no condition is returned", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientConditionSearch.mockReturnValue(
      Promise.resolve({ data: { total: 0 } })
    );
    wrapper = render(
      <BrowserRouter>
        <ConditionsBriefSummary match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(
        wrapper.getByText("No Conditions are documented.").textContent
      ).toBeDefined();
    });
  });
});
