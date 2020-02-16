import React from "react";
import { performPatientConditionsSearch } from "./conditions.resource";
import { render, cleanup, wait } from "@testing-library/react";
import { BrowserRouter, match } from "react-router-dom";
import { useCurrentPatient } from "../../../__mocks__/openmrs-esm-api.mock";
import ConditionsSummary from "./conditions-summary.component";
import {
  patient,
  mockPatientConditionsResult
} from "../../../__mocks__/conditions.mock";

const mockPerformPatientConditionsSearch = performPatientConditionsSearch as jest.Mock;
const mockUseCurrentPatient = useCurrentPatient as jest.Mock;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: key => key })
}));

jest.mock("./conditions.resource", () => ({
  performPatientConditionsSearch: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

describe("<ConditionsSummary />", () => {
  let match: match = { params: {}, isExact: false, path: "/", url: "/" };
  let wrapper: any;

  afterEach(cleanup);
  beforeEach(mockPerformPatientConditionsSearch.mockReset);
  beforeEach(mockUseCurrentPatient.mockReset);

  it("renders without dying", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientConditionsSearch.mockReturnValue(
      Promise.resolve(mockPatientConditionsResult)
    );
    wrapper = render(
      <BrowserRouter>
        <ConditionsSummary match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });

  it("should display the patient's conditions correctly", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientConditionsSearch.mockReturnValue(
      Promise.resolve(mockPatientConditionsResult)
    );
    wrapper = render(
      <BrowserRouter>
        <ConditionsSummary match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("Renal rejection").textContent).toBeTruthy();
      expect(wrapper.getByText("Overweight").textContent).toBeTruthy();
      expect(wrapper.getByText("Fever").textContent).toBeTruthy();
      expect(wrapper.getByText("Hypertension").textContent).toBeTruthy();
    });
  });

  it("should not display the patients conditions when no condition is returned", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientConditionsSearch.mockReturnValue(
      Promise.resolve({ data: { total: 0 } })
    );
    wrapper = render(
      <BrowserRouter>
        <ConditionsSummary match={match} />
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
