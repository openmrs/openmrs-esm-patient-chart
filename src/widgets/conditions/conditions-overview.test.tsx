import React from "react";
import { cleanup, render, wait } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { performPatientConditionsSearch } from "./conditions.resource";
import ConditionsOverview from "./conditions-overview.component";
import { useCurrentPatient } from "@openmrs/esm-api";
import {
  patient,
  mockPatientConditionsResult
} from "../../../__mocks__/conditions.mock";

const mockUseCurrentPatient = useCurrentPatient as jest.MockedFunction<any>;
const mockPerformPatientConditionsSearch = performPatientConditionsSearch as jest.Mock;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: key => key })
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

jest.mock("./conditions.resource", () => ({
  performPatientConditionsSearch: jest.fn()
}));

const match = { params: {}, isExact: false, path: "/", url: "/" };
let wrapper;

describe("<ConditionsOverview />", () => {
  afterEach(() => {
    cleanup;
  });

  beforeEach(mockUseCurrentPatient.mockReset);

  it("should render without dying", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);

    mockPerformPatientConditionsSearch.mockResolvedValue(
      mockPatientConditionsResult
    );

    wrapper = render(
      <BrowserRouter>
        <ConditionsOverview match={match} />
      </BrowserRouter>
    );
    await wait(() => {
      expect(wrapper).toBeTruthy();
    });
  });

  it("should display the patient conditions correctly", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockPerformPatientConditionsSearch.mockReturnValue(
      Promise.resolve(mockPatientConditionsResult)
    );

    wrapper = render(
      <BrowserRouter>
        <ConditionsOverview match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper.getByText("Hypertension")).toBeTruthy();
      expect(wrapper.getByText("Renal rejection")).toBeTruthy();
    });
  });
});
