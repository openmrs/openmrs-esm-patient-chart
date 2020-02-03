import React from "react";
import { match } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { cleanup, render, wait, fireEvent } from "@testing-library/react";
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
  beforeEach(mockGetConditionByUuid.mockReset);
  beforeEach(mockUseCurrentPatient.mockReset);

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

  it("displays the appropriate fields when adding a new condition", async () => {
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
      expect(wrapper.getByText("Add condition")).toBeDefined();
      expect(wrapper.getByText("Condition")).toBeDefined();
      expect(wrapper.getByText("Date of onset")).toBeDefined();
      expect(wrapper.getByRole("img")).toBeDefined();
      expect(wrapper.getByText("Current status")).toBeDefined();
      expect(wrapper.getByLabelText("Active")).toBeDefined();
      expect(wrapper.getByLabelText("Inactive")).toBeDefined();
      expect(wrapper.getByLabelText("History of")).toBeDefined();
      expect(wrapper.getByText("Cancel")).toBeDefined();
      expect(wrapper.getByText("Sign & Save")).toBeDefined();
    });
  });

  it("displays the appropriate fields and values when editing an existing condition", async () => {
    match.params = { conditionUuid: "26EFFA98F55D48B38687B3920285BE15" };
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
      expect(wrapper.getByText("Edit conditions")).toBeDefined();
      expect(wrapper.getByText("Renal rejection")).toBeDefined();
      expect(wrapper.getByRole("img")).toBeDefined();
      expect(wrapper.getByText("Date of onset")).toBeDefined();
      expect(wrapper.getByDisplayValue("2011-07-30")).toBeDefined();
      expect(wrapper.getByText("Current status")).toBeDefined();
      expect(wrapper.getByLabelText("Active")).toBeDefined();
      expect(wrapper.getByLabelText("Active").checked).toEqual(true);
      expect(wrapper.getByLabelText("Inactive")).toBeDefined();
      expect(wrapper.getByLabelText("Inactive").checked).toEqual(false);
      expect(wrapper.getByLabelText("History of")).toBeDefined();
      expect(wrapper.getByLabelText("History of").checked).toEqual(false);
      expect(wrapper.getByText("Cancel changes")).toBeDefined();
      expect(wrapper.getByText("Delete")).toBeDefined();
      expect(wrapper.getByText("Sign & Save")).toBeDefined();
    });
  });

  it("sets the selected option as the value of the current status field", async () => {
    match.params = { conditionUuid: "26EFFA98F55D48B38687B3920285BE15" };
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
      const activeCheckbox = wrapper.getByLabelText("Active");
      const inactiveCheckbox = wrapper.getByLabelText("Inactive");
      expect(activeCheckbox.checked).toEqual(true);
      fireEvent.click(inactiveCheckbox);
      expect(activeCheckbox.checked).toEqual(false);
      expect(inactiveCheckbox.checked).toEqual(true);
    });
  });
});
