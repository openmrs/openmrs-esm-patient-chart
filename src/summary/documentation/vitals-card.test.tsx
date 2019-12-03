import React from "react";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { cleanup, render, wait } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import VitalsCard from "./vitals-card.component";
import { of } from "rxjs/internal/observable/of";
import * as openmrsApi from "@openmrs/esm-api";
import { mockVitalsResponse } from "../../../__mocks__/vitals.mock";
import dayjs from "dayjs";

describe("<VitalsCard/>", () => {
  let patient: fhir.Patient, match;

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("renders without dying", () => {
    const wrapper = render(
      <BrowserRouter>
        <VitalsCard match={match} patient={patient} />
      </BrowserRouter>
    );
  });

  //   it("should display the patients vitals correctly", async () => {
  //     const spy = jest.spyOn(openmrsApi, "openmrsObservableFetch");
  //     spy.mockReturnValue(of(mockVitalsResponse));

  //     const wrapper = render(
  //       <BrowserRouter>
  //         <VitalsCard match={match} patient={patient} />
  //       </BrowserRouter>
  //     );
  //     await wait(() => {
  //       const tableBody = wrapper.container.querySelector("tbody");
  //       const firstTableRow = tableBody.children[0];
  //       const secondTableRow = tableBody.children[1];

  //       const testDate = dayjs("2016-05-16T06:13:36.000+00:00");
  //       const testDate2 = dayjs("2015-08-25T06:30:35.000+00:00");

  //       expect(firstTableRow.children[0].textContent).toBe(
  //         testDate.format("YYYY DD-MMM")
  //       );

  //       expect(firstTableRow.children[1].textContent).toBe("161 / 72 mmHg");
  //       expect(firstTableRow.children[2].textContent).toBe("22 bpm");
  //       expect(firstTableRow.children[3].textContent).toBe("30 %");
  //       expect(firstTableRow.children[4].textContent).toBe("37 ℃");

  //       expect(secondTableRow.children[0].textContent).toBe(
  //         testDate2.format("YYYY DD-MMM")
  //       );
  //       expect(secondTableRow.children[1].textContent).toBe("156 / 64");
  //       expect(secondTableRow.children[2].textContent).toBe("173 ");
  //       expect(secondTableRow.children[3].textContent).toBe("41 ");
  //       expect(secondTableRow.children[4].textContent).toBe("37");

  //       spy.mockRestore();
  //     });
  //   });

  //   it("should not display the patients vitals when vitals are absent", async () => {
  //     const spy = jest.spyOn(openmrsApi, "openmrsObservableFetch");
  //     spy.mockReturnValue(of());

  //     const wrapper = render(
  //       <BrowserRouter>
  //         <VitalsCard match={match} patient={patient} />
  //       </BrowserRouter>
  //     );
  //     await wait(() => {
  //       const tableBody = wrapper.container.querySelector("tbody");
  //       expect(tableBody.children.length).toBe(0);

  //       spy.mockRestore();
  //     });
  //   });
});
