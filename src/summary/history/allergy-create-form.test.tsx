import React from "react";
import { match } from "react-router";
import { cleanup, render, wait, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AllergyCreateForm } from "./allergy-create-form.component";
import { useCurrentPatient } from "@openmrs/esm-api";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { act } from "react-dom/test-utils";
import {
  getAllergyAllergenByConceptUuid,
  getAllergyReaction
} from "./allergy-intolerance.resource";
import {
  mockAllegenResponse,
  mockAllergyReactions
} from "../../../__mocks__/allergy.mock";
import { of } from "rxjs";

const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockGetAllergyAllergenByConceptUuid = getAllergyAllergenByConceptUuid as jest.Mock;
const mockgetAllergyReaction = getAllergyReaction as jest.Mock;

jest.mock("./allergy-intolerance.resource", () => ({
  savePatientAllergy: jest.fn(),
  getAllergyReaction: jest.fn(),
  getAllergyAllergenByConceptUuid: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

describe("<AllergyCardLevelThreeAdd />", () => {
  let match: match = { params: {}, isExact: false, path: "/", url: "/" };
  let wrapper: any;
  let patient: fhir.Patient;

  afterEach(cleanup);
  beforeEach(() => {
    patient = mockPatient;
  });

  it("render without dying", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    wrapper = render(
      <BrowserRouter>
        <AllergyCreateForm match={match} />
      </BrowserRouter>
    );
  });

  it("should display drug allergen correctly when DRUG category is selected", async () => {
    jest.useFakeTimers();
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockGetAllergyAllergenByConceptUuid.mockReturnValue(
      of(mockAllegenResponse.setMembers)
    );
    mockgetAllergyReaction.mockReturnValue(of(mockAllergyReactions.setMembers));
    const wrapper = render(
      <BrowserRouter>
        <AllergyCreateForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      const drugCheckBox = wrapper.container.querySelector("input");
      act(() => {
        fireEvent.click(drugCheckBox, {});
      });
      jest.advanceTimersByTime(1000);
      expect(wrapper.getByText("Drug allergen")).toBeTruthy();
    });
  });
});
