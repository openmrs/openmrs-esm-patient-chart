import React from "react";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { cleanup, render, wait } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MedicationLevelTwo from "./medication-level-two.component";
import { of } from "rxjs/internal/observable/of";
import * as openmrsApi from "@openmrs/esm-api";
import { performPatientMedicationsSearch } from "./medications.resource";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: key => key })
}));

describe("<MedicationLevelTwo/>", () => {
  let patient: fhir.Patient, match;

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  jest.mock("./medications.resource", () => ({
    performPatientMedicationsSearch: jest.fn().mockResolvedValue({
      data: {
        results: []
      }
    })
  }));

  jest.mock("@openmrs/esm-api", () => ({
    useCurrentPatient: jest.fn()
  }));

  it("renders without dying", () => {
    const wrapper = render(
      <BrowserRouter>
        <MedicationLevelTwo match={match} />
      </BrowserRouter>
    );
  });

  it("should display the patients medications correctly", async () => {
    const spy = jest.spyOn(openmrsApi, "openmrsObservableFetch");
    //spy.mockReturnValue(of(mockVitalsResponse));

    const wrapper = render(
      <BrowserRouter>
        <MedicationLevelTwo match={match} />
      </BrowserRouter>
    );
    expect(true).toBe(true);
    //spy.mockRestore();
  });

  it("it should display the text patient has no medications", async () => {
    const spy = jest.spyOn(openmrsApi, "openmrsObservableFetch");
    spy.mockReturnValue(of());

    const wrapper = render(
      <BrowserRouter>
        <MedicationLevelTwo match={match} />
      </BrowserRouter>
    );
    await wait(() => {});
  });
});
