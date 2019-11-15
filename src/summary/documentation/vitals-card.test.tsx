import React from "react";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { cleanup, render, wait } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import VitalsCard from "./vitals-card.component";
import { of } from "rxjs/internal/observable/of";
import * as openmrsApi from "./vitals-card.resource";

describe("<VitalsCard/>", () => {
  let patient: fhir.Patient, match;
  const mockVitalsResponse = [
    {
      id: 1463379216000,
      date: "2016-05-16T06:13:36.000+00:00",
      systolic: 161,
      diastolic: 72,
      pulse: 22,
      temperature: 37,
      oxygenation: 30
    },
    {
      id: 144048423500012,
      date: "2015-08-25T06:30:35.000+00:00",
      systolic: 156,
      diastolic: 64,
      pulse: 173,
      temperature: 37,
      oxygenation: 41
    }
  ];
  afterEach(() => {
    cleanup;
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
    expect(wrapper).toBeDefined();
  });

  it("should display the patients vitals correctly", async () => {
    const spy = jest
      .spyOn(openmrsApi, "performPatientsVitalsSearch")
      .mockImplementation(
        (openmrsApi["openmrsObservableFetch"] = jest
          .fn()
          .mockReturnValue(of(mockVitalsResponse)))
      );

    const wrapper = render(
      <BrowserRouter>
        <VitalsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    await wait(() => {
      const tableBody = wrapper.container.querySelector("tbody");
      const firstTableRow = tableBody.children[0];
      const secondTableRow = tableBody.children[1];
      expect(firstTableRow.children[0].textContent).toBe("2016 16-May");
      expect(firstTableRow.children[1].textContent).toBe("161 / 72 mmHg");
      expect(firstTableRow.children[2].textContent).toBe("22 bpm");
      expect(firstTableRow.children[3].textContent).toBe("30 %");
      expect(firstTableRow.children[4].textContent).toBe("37 ℃");
      expect(secondTableRow.children[0].textContent).toBe("2015 25-Aug");
      expect(secondTableRow.children[1].textContent).toBe("156 / 64");
      expect(secondTableRow.children[2].textContent).toBe("173 ");
      expect(secondTableRow.children[3].textContent).toBe("41 ");
      expect(secondTableRow.children[4].textContent).toBe("37");
    });
  });

  it("should not display the patients vitals when vitals are absent", async () => {
    const spy = jest
      .spyOn(openmrsApi, "performPatientsVitalsSearch")
      .mockImplementation(
        (openmrsApi["openmrsObservableFetch"] = jest
          .fn()
          .mockReturnValue(of([])))
      );

    const wrapper = render(
      <BrowserRouter>
        <VitalsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    await wait(() => {
      const tableBody = wrapper.container.querySelector("tbody");
      expect(tableBody.children.length).toBe(0);
    });
  });
});
