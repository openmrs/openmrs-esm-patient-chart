import React from "react";
import VisitDashboard from "./visit-dashboard.component";
import { BrowserRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  getCurrentPatientUuid,
  openmrsObservableFetch,
  openmrsFetch,
} from "@openmrs/esm-framework";
import { of } from "rxjs/internal/observable/of";
import {
  mockVisitTypesDataResponse,
  mockVisits,
} from "../../../../__mocks__/visits.mock";
import { mockLocationsDataResponse } from "../../../../__mocks__/location.mock";
import { mockSessionDataResponse } from "../../../../__mocks__/session.mock";

const mockGetCurrentPatientUuid = getCurrentPatientUuid as jest.Mock;
const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;

mockOpenmrsObservableFetch.mockImplementation(jest.fn());
mockOpenmrsFetch.mockImplementation(jest.fn());

describe("VisitDashboard", () => {
  let patientUuid = "some-patient-uuid";
  beforeEach(() => {
    mockGetCurrentPatientUuid.mockReturnValue(of(patientUuid));
    mockOpenmrsObservableFetch.mockImplementation(
      (url: string, config: { method: string; body: any }) => {
        if (url.indexOf("/visittype") >= 0) {
          return of(mockVisitTypesDataResponse);
        }
        if (url.indexOf("/location") >= 0) {
          return of(mockLocationsDataResponse);
        }
        if (url.indexOf("/session") >= 0) {
          return of(mockSessionDataResponse);
        }
        if (url.indexOf("/visit") >= 0 && config.method === "POST") {
          return of({ data: config.body });
        }
        if (url.indexOf("?patient") >= 0) {
          return of(mockVisits);
        }
        // return nothing to ensure that all api calls are mocked
      }
    );
    mockOpenmrsFetch.mockImplementation(
      (url: string, config: { method: string; body: any }) => {
        if (url.indexOf("/visit") >= 0 && config.method === "GET") {
          return Promise.resolve(mockVisits);
        }
      }
    );

    render(
      <BrowserRouter>
        <VisitDashboard />
      </BrowserRouter>
    );
  });

  afterEach(mockGetCurrentPatientUuid.mockReset);
  afterEach(mockOpenmrsObservableFetch.mockReset);

  it("should display new visit and edit visit buttons", async () => {
    expect(
      await screen.findByRole("button", { name: /New Visit/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /Edit Visit/i })
    ).toBeInTheDocument();
  });

  it("should open and close new visit component", async () => {
    const newVisitButton = await screen.findByRole("button", {
      name: /New Visit/i,
    });
    fireEvent.click(newVisitButton);
    expect(await screen.findByText(/start new visit/i)).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /Cancel/ })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /Start/ })
    ).toBeInTheDocument();
  });

  it("should open and close edit visit component", async () => {
    const editButton = await screen.findByRole("button", {
      name: /Edit Visit/i,
    });
    fireEvent.click(editButton);
    expect(await screen.findByText(/28-Jul.2020/)).toBeTruthy();
    expect(await screen.findByText(/Facility Visit/)).toBeTruthy();
    expect(await screen.findByText(/Laboratory/)).toBeTruthy();
    expect(
      await screen.findByRole("button", { name: /edit/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /load/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();

    const cancelButton = await screen.findByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);
  });

  it("should load selected visit", async () => {
    const editButton = await screen.findByRole("button", {
      name: /Edit Visit/i,
    });
    fireEvent.click(editButton);
    const loadVisitButton = await screen.findByRole("button", {
      name: /load/i,
    });
    fireEvent.click(loadVisitButton);
  });

  it("should display the edit mode of visit dashboard", async () => {
    const editButton = await screen.findByRole("button", {
      name: /Edit Visit/i,
    });
    fireEvent.click(editButton);
    const editVisitButton = await screen.findByRole("button", {
      name: /edit/i,
    });
    fireEvent.click(editVisitButton);
    expect(await screen.findByText(/location/i)).toBeInTheDocument();
  });
});
