import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, cleanup, wait } from "@testing-library/react";
import { of } from "rxjs";
import * as openmrsApi from "@openmrs/esm-api";
import DimensionsCardLevelTwo from "./dimensions-card-level-two.component";
import { calculateBMI, formatDate } from "./dimension-helpers";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { mockDimensionResponse } from "../../../__mocks__/dimensions.mock";

describe("<DimensionsCardLevelTwo/>", () => {
  let patient: fhir.Patient, match;

  afterEach(cleanup);

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("renders successfully", () => {
    render(
      <BrowserRouter>
        <DimensionsCardLevelTwo
          currentPatient={patient}
          match={match}
        ></DimensionsCardLevelTwo>
      </BrowserRouter>
    );
  });

  it("renders dimensions correctly", async () => {
    const spy = jest.spyOn(openmrsApi, "openmrsObservableFetch");
    spy.mockReturnValue(of(mockDimensionResponse));
    const wrapper = render(
      <BrowserRouter>
        <DimensionsCardLevelTwo
          currentPatient={patient}
          match={match}
        ></DimensionsCardLevelTwo>
      </BrowserRouter>
    );
    await wait(() => {
      const el = wrapper.container.querySelector("tbody");
      const tableRows = el.children;
      const firstTableRow = el.children[0];
      const secondTableRow = el.children[1];
      expect(tableRows.length).toBe(2);
      expect(firstTableRow.children[0].textContent).toBe("13-Nov 06:49 AM");
      expect(secondTableRow.children[0].textContent).toBe("2016 18-Dec");
      expect(secondTableRow.children[1].textContent).toBe("173");
      expect(secondTableRow.children[2].textContent).toBe("173");
      expect(secondTableRow.children[3].textContent).toBe("57.8");
    });
  });
});

it("calculates BMI correctly", () => {
  let dimension = calculateBMI(75, 165);
  expect(dimension).toBe("27.5");
  dimension = calculateBMI(-1, 24);
  expect(dimension).toBeNull();
});

it("renders dates according to designs", () => {
  const today = new Date();
  const sometimeLastYear = `${today.getFullYear() - 1}-11-13T09:32:14`;
  const sometimeThisYear = `${today.getFullYear()}-04-26T06:49:00`;
  expect(formatDate(sometimeLastYear)).toBe(
    `${today.getFullYear() - 1} 13-Nov`
  );
  expect(formatDate(sometimeThisYear)).toBe(`26-Apr 06:49 AM`);
  expect(formatDate(today.toString())).toBe(
    `Today ${get12Hour(today.getHours())}:${zeroBase(today.getMinutes())} ${
      today.getHours() > 12 ? "PM" : "AM"
    }`
  );

  function zeroBase(num) {
    return num < 10 ? `0${num}` : num;
  }
  function get12Hour(hour) {
    return hour > 12 ? zeroBase(hour - 12) : zeroBase(hour);
  }
});
