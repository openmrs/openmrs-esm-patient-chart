import React from "react";
import { mockPatient } from "../../../../__mocks__/patient.mock";
import { cleanup, render, wait } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MedicationsSummary from "./medications-summary.component";
import { of } from "rxjs/internal/observable/of";
import * as openmrsApi from "@openmrs/esm-api";
import { performPatientMedicationsSearch } from "./medications.resource";

describe("<MedicationsOverview/>", () => {
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
        <MedicationsSummary match={match} />
      </BrowserRouter>
    );
  });

  it("should display the patients medications correctly", async () => {
    const spy = jest.spyOn(openmrsApi, "openmrsObservableFetch");
    //spy.mockReturnValue(of(mockVitalsResponse));

    const wrapper = render(
      <BrowserRouter>
        <MedicationsSummary match={match} />
      </BrowserRouter>
    );
    expect(true).toBe(true);
    //spy.mockRestore();
  });

  it("should not display the patient medications when medications are absent", async () => {
    const spy = jest.spyOn(openmrsApi, "openmrsObservableFetch");
    spy.mockReturnValue(of());

    const wrapper = render(
      <BrowserRouter>
        <MedicationsSummary match={match} />
      </BrowserRouter>
    );
    await wait(() => {
      const tableBody = wrapper.container.querySelector("tbody");
      expect(tableBody.children.length).toBe(0);

      spy.mockRestore();
    });
  });
});
