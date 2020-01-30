import React from "react";
import { match } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { cleanup, render, wait } from "@testing-library/react";
import { useCurrentPatient } from "@openmrs/esm-api";
import { getConditionByUuid } from "./conditions.resource";
import {
  patient,
  mockPatientConditionResult
} from "../../../__mocks__/conditions.mock";
import { ConditionsForm } from "./conditions-form.component";

const mockGetConditionByUuid = getConditionByUuid as jest.Mock;
const mockUseCurrentPatient = useCurrentPatient as jest.Mock;

jest.mock("./conditions.resource", () => ({
  getConditionByUuid: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

describe("<ConditionsForm />", () => {
  let match: match = { params: {}, isExact: false, path: "/", url: "/" };
  let wrapper: any;

  afterEach(cleanup);
  beforeEach(mockUseCurrentPatient.mockReset);
  beforeEach(mockGetConditionByUuid.mockReset);

  it("renders without dying", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockGetConditionByUuid.mockReturnValue(
      Promise.resolve(mockPatientConditionResult)
    );
    wrapper = render(
      <BrowserRouter>
        <ConditionsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });
});
