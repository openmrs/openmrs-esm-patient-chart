import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, cleanup, wait } from "@testing-library/react";
import { of } from "rxjs";
import HeightAndWeightSummary from "./heightandweight-summary.component";
import { calculateBMI, formatDate } from "./heightandweight-helper";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { mockDimensionResponseRESTAPI } from "../../../__mocks__/dimensions.mock";
import { useCurrentPatient, openmrsObservableFetch } from "@openmrs/esm-api";
import dayjs from "dayjs";

const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn(),
  openmrsObservableFetch: jest.fn()
}));

describe("<HeightAndWeightSummary/>", () => {
  let patient: fhir.Patient, match;

  afterEach(cleanup);
  beforeEach(mockUseCurrentPatient.mockReset);

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("renders successfully", () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockOpenmrsObservableFetch.mockReturnValue(
      of(mockDimensionResponseRESTAPI)
    );
    render(
      <BrowserRouter>
        <HeightAndWeightSummary match={match}></HeightAndWeightSummary>
      </BrowserRouter>
    );
  });

  it("renders dimensions correctly", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockOpenmrsObservableFetch.mockReturnValue(
      of(mockDimensionResponseRESTAPI)
    );
    const wrapper = render(
      <BrowserRouter>
        <HeightAndWeightSummary match={match}></HeightAndWeightSummary>
      </BrowserRouter>
    );
    await wait(() => {
      const el = wrapper.container.querySelector("tbody");
      const tableRows = el.children;
      const firstTableRow = el.children[0];
      const secondTableRow = el.children[1];
      expect(tableRows.length).toBe(2);

      const d1 = dayjs();

      expect(firstTableRow.children[0].textContent).toBe(`Today 06:49 AM`);
      expect(secondTableRow.children[0].textContent).toBe("2016 18-Dec");
      expect(secondTableRow.children[1].textContent).toBe("\u2014");
      expect(secondTableRow.children[2].textContent).toBe("173");
      expect(secondTableRow.children[3].textContent).toBe("\u2014");
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

  /*
  expect(formatDate(today.toString())).toBe(
    `Today ${get12Hour(today.getHours())}:${zeroBase(today.getMinutes())} ${
      today.getHours() < 12 ? "A" : "P"
    }M`
  );
  */

  function zeroBase(num) {
    return num < 10 ? `0${num}` : num;
  }
  function get12Hour(hour) {
    return hour > 12 ? zeroBase(hour - 12) : zeroBase(hour);
  }
});
