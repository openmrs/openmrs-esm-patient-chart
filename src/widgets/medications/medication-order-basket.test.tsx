import React from "react";
import { BrowserRouter, match } from "react-router-dom";
import {
  useCurrentPatient,
  openmrsFetch,
  openmrsObservableFetch
} from "@openmrs/esm-api";
import { cleanup, render, wait } from "@testing-library/react";
import { MedicationOrderBasket } from "./medication-order-basket.component";
import { mockPatient } from "../../../__mocks__/patient.mock";

const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockOpenmrsfetch = openmrsFetch as jest.Mock;
const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: key => key })
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn(),
  openmrsFetch: jest.fn(),
  openmrsObservableFetch: jest.fn()
}));
describe("<MedicationOrdeBasket>", () => {
  let match: match = { params: {}, isExact: false, path: "/", url: "/" };
  let patient = mockPatient;
  afterEach(cleanup);
  beforeEach(() => {
    mockUseCurrentPatient.mockReset;
    mockOpenmrsObservableFetch.mockReset;
    mockOpenmrsfetch.mockReset;
  });

  it("renders without dying", async () => {
    mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
    const wrapper = render(
      <BrowserRouter>
        <MedicationOrderBasket match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });
});
