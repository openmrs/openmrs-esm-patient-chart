import React from "react";
import { getConditionByUuid } from "./conditions.resource";
import { render, cleanup, wait } from "@testing-library/react";
import { BrowserRouter, match } from "react-router-dom";
import ConditionsDetailedSummary from "./conditions-detailed-summary.component";
import { useCurrentPatient } from "../../../__mocks__/openmrs-esm-api.mock";
import {
  patient,
  mockPatientConditionResult
} from "../../../__mocks__/conditions.mock";

const mockPerformPatientConditionSearch = getConditionByUuid as jest.Mock;
const mockUseCurrentPatient = useCurrentPatient as jest.Mock;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: key => key })
}));

jest.mock("./conditions.resource", () => ({
  getConditionByUuid: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

describe("<ConditionsDetailedSummary />", () => {
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
        <ConditionsDetailedSummary match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });

  it("displays a detailed summary of the selected condition", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientConditionSearch.mockReturnValue(
      Promise.resolve(mockPatientConditionResult)
    );
    wrapper = render(
      <BrowserRouter>
        <ConditionsDetailedSummary match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByTestId("condition-name").textContent).toContain(
        "Renal rejection"
      );
      expect(wrapper.getByTestId("onset-date").textContent).toEqual("Jul-2011");
      expect(wrapper.getByTestId("clinical-status").textContent).toEqual(
        "Active"
      );
      expect(wrapper.getByTestId("updated-by").textContent).toEqual(
        "Dr. Katherine Mwangi"
      );
      expect(wrapper.getByTestId("update-location").textContent).toEqual(
        "Busia, Clinic"
      );
    });
  });
});
