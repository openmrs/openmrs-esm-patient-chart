import React from "react";
import { cleanup, render, wait } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { fetchPatientPrograms } from "./programs.resource";
import ProgramsOverview from "./programs-overview.component";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { mockProgramsResponse } from "../../../__mocks__/programs.mocks";
import * as openmrsApi from "@openmrs/esm-api";
import { of } from "rxjs/internal/observable/of";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: key => key })
}));

describe("<ProgramsOverview />", () => {
  let match, wrapper: any, patient: fhir.Patient, programs: any;

  afterEach(cleanup);

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("should render without dying", async () => {
    wrapper = render(
      <BrowserRouter>
        <ProgramsOverview match={match} />
      </BrowserRouter>
    );
    await wait(() => {
      expect(wrapper).toBeTruthy();
    });
  });

  it("should display the patients programs correctly", async () => {
    const spy = jest.spyOn(openmrsApi, "openmrsObservableFetch");
    spy.mockReturnValue(of(mockProgramsResponse));

    const wrapper = render(
      <BrowserRouter>
        <ProgramsOverview match={match} />
      </BrowserRouter>
    );
    await wait(() => {
      expect(wrapper.getByTitle("HIV Care and Treatment")).toBeDefined();
      spy.mockRestore();
    });
  });
});
