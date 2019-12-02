import React from "react";
import { cleanup, render, wait } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";
import { performPatientProgramsSearch } from "./programs.resource";
import ProgramsCard from "./programs-card.component";
import { useCurrentPatient } from "@openmrs/esm-api";

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn
}));

jest.mock("./programs.resource", () => ({
  performPatientProgramsSearch: jest.fn()
}));

let wrapper;

describe("<ProgramsCard />", () => {
  let match, wrapper: any;

  afterEach(cleanup);

  beforeEach(() => {
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("should render without dying", async () => {
    wrapper = render(
      <BrowserRouter>
        <ProgramsCard match={match} />
      </BrowserRouter>
    );
    await wait(() => {
      expect(wrapper).toBeTruthy();
    });
  });

});
