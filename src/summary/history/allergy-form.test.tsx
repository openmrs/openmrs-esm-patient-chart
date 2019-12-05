import React from "react";
import { match } from "react-router";
import { useCurrentPatient } from "@openmrs/esm-api";
import { mockPatient } from "../../../__mocks__/patient.mock";
import {
  getAllergyReaction,
  getPatientAllergyByPatientUuid
} from "./allergy-intolerance.resource";
import { cleanup, render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AllergyForm } from "./allergy-form.component";
import {
  mockPatientAllergy,
  mockAllergyReactions
} from "../../../__mocks__/allergy.mock";
import { of } from "rxjs";
import { act } from "react-dom/test-utils";

const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockGetPatientAllergyByPatientUuid = getPatientAllergyByPatientUuid as jest.Mock;
const mockGetAllegyReaction = getAllergyReaction as jest.Mock;

jest.mock("./allergy-intolerance.resource", () => ({
  getAllergyReaction: jest.fn(),
  getAllergyAllergenByConceptUuid: jest.fn(),
  getPatientAllergyByPatientUuid: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

describe("<AllergyForm />", () => {
  let match: match = { params: {}, isExact: false, path: "/", url: "/" };
  let wrapper: any;
  let patient: fhir.Patient;

  afterEach(cleanup);
  beforeEach(() => {
    patient = mockPatient;
  });

  it("should render without dying", async () => {
    act(() => {
      mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
      mockGetPatientAllergyByPatientUuid.mockResolvedValue(mockPatientAllergy);
      mockGetAllegyReaction.mockReturnValue(
        of(mockAllergyReactions.setMembers)
      );
      <BrowserRouter>
        <AllergyForm match={match} />
      </BrowserRouter>;
    });
  });
});
