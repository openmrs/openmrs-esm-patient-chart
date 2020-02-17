import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, cleanup, wait } from "@testing-library/react";
import RelationshipsCard from "./relationships-card.component";
import { mockRelationships } from "../../../__mocks__/relationships.mock";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { fetchPatientRelationships } from "./relationships.resource";
const mockFetchPatientRelationships = fetchPatientRelationships as jest.Mock;

jest.mock("./relationships.resource", () => ({
  fetchPatientRelationships: jest.fn().mockResolvedValue({
    data: []
  })
}));

describe("<RelationshipsCard/>", () => {
  let patient: fhir.Patient, match;

  afterEach(cleanup);

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("renders successfully", () => {
    render(
      <BrowserRouter>
        <RelationshipsCard patient={patient} match={match}></RelationshipsCard>
      </BrowserRouter>
    );
  });

  it("displays em-dash if there are no relationships", () => {
    const wrapper = render(
      <BrowserRouter>
        <RelationshipsCard patient={patient} match={match}></RelationshipsCard>
      </BrowserRouter>
    );
    expect(wrapper.getByText("\u2014")).not.toBeNull();
  });

  it("renders relationships correctly", async () => {
    mockFetchPatientRelationships.mockResolvedValueOnce(mockRelationships);
    const wrapper = render(
      <BrowserRouter>
        <RelationshipsCard patient={patient} match={match}></RelationshipsCard>
      </BrowserRouter>
    );
    await wait(() => {
      expect(wrapper.getByTitle("Doctor")).not.toBeNull();
      expect(wrapper.getByTitle("Doctor").textContent).toBe("Michael Okoro");
      expect(wrapper.getByTitle("Parent")).not.toBeNull();
      expect(wrapper.getByTitle("Parent").textContent).toBe("Mannet Monica");
    });
  });
});
