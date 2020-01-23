import React from "react";
import { BrowserRouter, match } from "react-router-dom";
import { MedicationOrder } from "./medication-order.component";
import { mockPatient } from "../../../__mocks__/patient.mock";
import {
  useCurrentPatient,
  openmrsFetch,
  openmrsObservableFetch
} from "@openmrs/esm-api";
import { cleanup, wait, render } from "@testing-library/react";
import {
  getDrugByName,
  getPatientEncounterID,
  getPatientDrugOrderDetails,
  getDurationUnits
} from "./medications.resource";
import {
  mockDrugSearchResults,
  mockPatientEncounterIDResults,
  mockDurationUnitsResults
} from "../../../__mocks__/medication.mock";

const mockCurrentPatient = useCurrentPatient as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;
const mockGetDrugByName = getDrugByName as jest.Mock;
const mockgetPatientEncounterID = getPatientEncounterID as jest.Mock;
const mockgetPatientDrugOrderDetails = getPatientDrugOrderDetails as jest.Mock;
const mockgetDurationUnits = getDurationUnits as jest.Mock;

jest.mock("./medications.resource", () => ({
  getDrugByName: jest.fn(),
  getPatientEncounterID: jest.fn(),
  getPatientDrugOrderDetails: jest.fn(),
  getDurationUnits: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn(),
  openmrsFetch: jest.fn(),
  openmrsObservableFetch: jest.fn()
}));

describe("MedicationOrder", () => {
  let match: match = { params: {}, isExact: false, path: "/", url: "/" };
  let patient: fhir.Patient = mockPatient;

  beforeEach(() => {
    mockCurrentPatient.mockReset;
    mockOpenmrsObservableFetch.mockReset;
    mockOpenmrsFetch.mockReset;
  });

  afterEach(cleanup);

  it("render without dying", async () => {
    mockCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockGetDrugByName.mockReturnValue(Promise.resolve(mockDrugSearchResults));
    mockgetPatientEncounterID.mockReturnValue(
      Promise.resolve(mockPatientEncounterIDResults)
    );
    mockgetPatientDrugOrderDetails.mockReturnValue(Promise.resolve({}));
    mockgetDurationUnits.mockReturnValue(
      Promise.resolve(mockDurationUnitsResults)
    );
    const wrapper = render(
      <BrowserRouter>
        <MedicationOrder match={match} drugUuid={"aspirin"} editProperty={[]} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper.container).toBeTruthy();
    });
  });
});
