import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, cleanup } from "@testing-library/react";
import IdentifiersCard from "./identifiers-card.component";
import { mockPatient } from "../../../__mocks__/patient.mock";

describe("<IdentifiersCard/>", () => {
  let patient: fhir.Patient, match;

  afterEach(cleanup);

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("renders successfully", () => {
    render(
      <BrowserRouter>
        <IdentifiersCard
          currentPatient={patient}
          match={match}
        ></IdentifiersCard>
      </BrowserRouter>
    );
  });

  it("displays identifiers correctly", () => {
    const wrapper = render(
      <BrowserRouter>
        <IdentifiersCard
          currentPatient={patient}
          match={match}
        ></IdentifiersCard>
      </BrowserRouter>
    );
    expect(wrapper.queryByText(/OpenMRS ID/i)).not.toBeNull();
    expect(wrapper.queryByText("100GEJ")).not.toBeNull();
  });
});
