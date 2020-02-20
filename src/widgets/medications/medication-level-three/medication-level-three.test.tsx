import React from "react";
import { render, cleanup, wait } from "@testing-library/react";
import { match, useRouteMatch } from "react-router";
import MedicationCardLevelThree from "./medication-level-three.component";
import { BrowserRouter } from "react-router-dom";
import { useCurrentPatient, openmrsFetch } from "@openmrs/esm-api";
import { mockPatient } from "../../../../__mocks__/patient.mock";
import { mockMedicationOrderByUuidResponse } from "../../../../__mocks__/medication.mock";

const mockUseRouteMatch = useRouteMatch as jest.Mock;
const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn(),
  openmrsFetch: jest.fn()
}));

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useRouteMatch: jest.fn()
}));

describe("<MedicationCardLevelThree />", () => {
  let patient: fhir.Patient = mockPatient;
  let match: match = {
    params: { medicationUuid: "bbd27a2f-442a-418a-9952-f2bb0e54df97" },
    isExact: true,
    path: "/patient/:patientUuid/chart/medications/:medicationUuid",
    url: "/"
  };
  let wrapper: any;

  afterEach(cleanup);

  beforeEach(() => {
    mockUseRouteMatch.mockReset();
  });

  it("renders without dying", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockUseRouteMatch.mockReturnValue(match);
    mockOpenmrsFetch.mockReturnValue(
      Promise.resolve(mockMedicationOrderByUuidResponse)
    );
    wrapper = render(
      <BrowserRouter>
        <MedicationCardLevelThree />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });
});
