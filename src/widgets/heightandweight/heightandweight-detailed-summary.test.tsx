import React from "react";
import { BrowserRouter } from "react-router-dom";
import { HeightAndWeightDetailedSummary } from "./heightandweight-detailed-summary.component";
import { useCurrentPatient, openmrsObservableFetch } from "@openmrs/esm-api";
import { mockDimensionResponseRESTAPI } from "../../../__mocks__/dimensions.mock";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { render, wait, cleanup, getByText } from "@testing-library/react";
import { of } from "rxjs";

const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn(),
  openmrsObservableFetch: jest.fn()
}));

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useParams: jest.fn()
}));

describe("<HeightAndWeightDetailedSummary/>", () => {
  let patient: fhir.Patient = mockPatient;
  beforeEach(() => {
    mockOpenmrsObservableFetch.mockReset();
    mockUseCurrentPatient.mockReset();
  });

  afterEach(cleanup);

  it("render withour dying", () => {
    mockOpenmrsObservableFetch.mockReturnValue(
      of(mockDimensionResponseRESTAPI)
    );
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    <BrowserRouter>
      <HeightAndWeightDetailedSummary uuid="bbd27a2f-442a-418a-9952-f2bb0e54df97"></HeightAndWeightDetailedSummary>
    </BrowserRouter>;
  });

  it("should display the height, weight, bmi correctly", async () => {
    mockOpenmrsObservableFetch.mockReturnValue(
      of(mockDimensionResponseRESTAPI)
    );
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    const wrapper = render(
      <BrowserRouter>
        <HeightAndWeightDetailedSummary uuid="bbd27a2f-442a-418a-9952-f2bb0e54df97"></HeightAndWeightDetailedSummary>
      </BrowserRouter>
    );
    await wait(() => {
      expect(getByText(wrapper.container, "65").textContent).toBe("65 Kg");
      expect(getByText(wrapper.container, "143.33").textContent).toBe(
        "143.33 lbs"
      );

      expect(getByText(wrapper.container, "165").textContent).toBe("165 cm");
      expect(
        getByText(wrapper.container, content => content.startsWith("5"))
          .textContent
      ).toBe("5 feet 4.96 inches");
      expect(getByText(wrapper.container, "23.9").textContent).toBe(
        "23.9 Kg/m2"
      );
    });
  });

  it("should display error message when response is empty", async () => {
    mockOpenmrsObservableFetch.mockReturnValue(
      of(mockDimensionResponseRESTAPI)
    );
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    const wrapper = render(
      <BrowserRouter>
        <HeightAndWeightDetailedSummary uuid="bbd27a2f-442a-418a-9952-f2bb0e54df65"></HeightAndWeightDetailedSummary>
      </BrowserRouter>
    );

    await wait(() => {
      expect(
        wrapper.getByText("The patient's Height and Weight is not documented.")
      ).toBeTruthy();
      expect(wrapper.getByText("add patient height and weight")).toBeTruthy();
    });
  });
});
