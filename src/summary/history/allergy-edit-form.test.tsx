import React from "react";
import { render, wait, cleanup, fireEvent } from "@testing-library/react";
import { BrowserRouter, match } from "react-router-dom";
import { AllergyEditForm } from "./allergy-edit-form.component";
import {
  getAllergyReaction,
  getPatientAllergyByPatientUuid
} from "./allergy-intolerance.resource";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { useCurrentPatient } from "@openmrs/esm-api";
import { of } from "rxjs";
import {
  mockPatientAllergy,
  mockAllergyReactions
} from "../../../__mocks__/allergy.mock";
import { act } from "react-dom/test-utils";

const mockGetAllegyReaction = getAllergyReaction as jest.Mock;
const mockGetPatientAllergyByPatientUuid = getPatientAllergyByPatientUuid as jest.Mock;
const mockUseCurrentPatient = useCurrentPatient as jest.Mock;

jest.mock("./allergy-intolerance.resource", () => ({
  getAllergyReaction: jest.fn(),
  getPatientAllergyByPatientUuid: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

describe("<AllergyEditForm />", () => {
  let wrapper: any;
  let match: match = { params: {}, isExact: false, path: "/", url: "/" };
  let patient: fhir.Patient;

  beforeEach(() => {
    patient = mockPatient;
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  it("should render without dying", async () => {
    act(() => {
      mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
      mockGetPatientAllergyByPatientUuid.mockResolvedValue(mockPatientAllergy);
      mockGetAllegyReaction.mockReturnValue(
        of(mockAllergyReactions.setMembers)
      );
      <BrowserRouter>
        <AllergyEditForm match={match} />
      </BrowserRouter>;
    });
  });

  it("should display the edit form and populate the required fields with data correctly", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockGetPatientAllergyByPatientUuid.mockResolvedValue(mockPatientAllergy);
    mockGetAllegyReaction.mockReturnValue(of(mockAllergyReactions.setMembers));
    act(() => {
      wrapper = render(
        <BrowserRouter>
          <AllergyEditForm match={match} />
        </BrowserRouter>
      );
    });

    await wait(() => {
      expect(wrapper.container.querySelector("h3").textContent).toBe(
        "ACE inhibitors (drug)"
      );
      expect(
        wrapper.container.querySelector("input[type=checkbox]:checked").value
      ).toBe("121677AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      expect(wrapper.container.querySelector("input[type=date]").value).toBe(
        "2019-12-16"
      );
      expect(wrapper.container.querySelector("textarea").value).toBe(
        "Patient Allergy comments"
      );
      expect(
        wrapper.container.querySelector("input[type=radio]:checked").value
      ).toBe("1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    });
  });

  it("Should update the comment form field with the user entered data correctly", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockGetPatientAllergyByPatientUuid.mockResolvedValue(mockPatientAllergy);
    mockGetAllegyReaction.mockReturnValue(of(mockAllergyReactions.setMembers));
    act(() => {
      wrapper = render(
        <BrowserRouter>
          <AllergyEditForm match={match} />
        </BrowserRouter>
      );
    });

    await wait(() => {
      const commentTextArea = wrapper.container.querySelector("textarea");
      expect(wrapper.container.querySelector("textarea").value).toBe(
        "Patient Allergy comments"
      );
      act(() => {
        fireEvent.change(commentTextArea, {
          target: { value: "Change Patient Comment" }
        });
      });

      expect(wrapper.container.querySelector("textarea").value).toBe(
        "Change Patient Comment"
      );
    });
  });
});
