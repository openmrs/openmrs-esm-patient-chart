import React from "react";
import { render, cleanup, wait } from "@testing-library/react";
import { BrowserRouter, match } from "react-router-dom";
import MedicationCardLevelThree from "./medication-level-three.component";
import { useRouteMatch } from "react-router";
import { mockPatient } from "../../../../__mocks__/patient.mock";

const mockUseReactRouterMatch = useRouteMatch as jest.Mock;

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useRouteMatch: jest.fn()
}));

describe("<MedicationCardLevelThree />", () => {
  let match: match = {
    params: { medicationUuid: "bbd27a2f-442a-418a-9952-f2bb0e54df97" },
    isExact: false,
    path: "/",
    url: "/"
  };
  let patient: fhir.Patient = mockPatient;
  let wrapper: any;

  afterEach(cleanup);

  beforeEach(() => {
    mockUseReactRouterMatch.mockReset();
  });

  it("renders without dying", async () => {
    mockUseReactRouterMatch.mockReturnValue(match);
    wrapper = render(
      <BrowserRouter>
        <MedicationCardLevelThree />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });
});
