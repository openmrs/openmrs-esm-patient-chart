import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, cleanup, wait, act } from "@testing-library/react";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { mockPatientEncounters } from "../../../__mocks__/encounters.mock";
import { encounterResource } from "./encounter.resource";
import NotesCard from "./notes-card.component";
const mockFetchPatientEncounters = encounterResource as jest.Mock;

jest.mock("./encounter.resource", () => ({
  encounterResource: jest.fn().mockResolvedValue({
    data: []
  })
}));

describe("<NotesCard/>", () => {
  let patient: fhir.Patient, match;
  let wrapper;

  afterEach(cleanup);

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("renders successfully", () => {
    render(
      <BrowserRouter>
        <NotesCard currentPatient={patient} match={match}></NotesCard>
      </BrowserRouter>
    );
  });

  it("displays see more on the footer", () => {
    const wrapper = render(
      <BrowserRouter>
        <NotesCard currentPatient={patient} match={match}></NotesCard>
      </BrowserRouter>
    );
    expect(wrapper.getByText("See all")).not.toBeNull();
  });
});
