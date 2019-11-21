import React from "react";
import { cleanup, render, wait, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { mockPatient } from "../../../__mocks__/patient.mock";
import VitalsLevelTwo from "./vital-card-level-two.component";
import { of } from "rxjs";
import {
  mockVitalsResponse,
  mockEmptyVitalsResponse,
  mockVitalData
} from "../../../__mocks__/vitals.mock";
import { useCurrentPatient, openmrsObservableFetch } from "@openmrs/esm-api";
import * as openmrsApi from "./vitals-card.resource";
import { act } from "react-dom/test-utils";

const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn(),
  openmrsObservableFetch: jest.fn()
}));

describe("<VitalsLevelTwo/>", () => {
  let patient: fhir.Patient;
  let match: any;

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("renders without dying", () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockOpenmrsObservableFetch.mockReturnValue(of(mockVitalsResponse));
    const wrapper = render(
      <BrowserRouter>
        <VitalsLevelTwo match={match} />
      </BrowserRouter>
    );
  });

  it("should display the patients vitals when response is not null", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockOpenmrsObservableFetch.mockReturnValue(of(mockVitalsResponse));

    const wrapper = render(
      <BrowserRouter>
        <VitalsLevelTwo match={match} />
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

  it("should display message to add vitals when no vitals are returned", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    mockOpenmrsObservableFetch.mockReturnValue(of(mockEmptyVitalsResponse));

    const wrapper = render(
      <BrowserRouter>
        <VitalsLevelTwo match={match} />
      </BrowserRouter>
    );
    await wait(() => {
      expect(wrapper.getByText("No Vitals are documentated")).toBeTruthy();
    });
  });

  it("should display the pagination buttons when results > 15", () => {
    jest.useFakeTimers();
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    const spy = jest
      .spyOn(openmrsApi, "performPatientsVitalsSearch")
      .mockImplementation(
        (openmrsApi["openmrsObservableFetch"] = jest
          .fn()
          .mockReturnValue(of(mockVitalData)))
      );
    const container = render(
      <BrowserRouter>
        <VitalsLevelTwo match={match} />
      </BrowserRouter>
    );
    const nextButton = container.container.getElementsByClassName(
      "navButton"
    )[0];

    act(() => {
      fireEvent.click(nextButton, {});
    });

    jest.advanceTimersByTime(1000);
    expect(container.getByText("Page 2 of 3")).toBeDefined();

    const prevButton = container.container.querySelectorAll("button")[1];
    act(() => {
      fireEvent.click(prevButton, {});
    });

    expect(container.getByText("Page 1 of 3")).toBeDefined();

    jest.clearAllMocks();
    jest.clearAllTimers();
  });
});
