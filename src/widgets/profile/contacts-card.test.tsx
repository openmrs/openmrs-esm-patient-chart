import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, cleanup } from "@testing-library/react";
import ContactsCard from "./contacts-card.component";
import { mockPatient } from "../../../__mocks__/patient.mock";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: key => key })
}));

describe("<ContactsCard/>", () => {
  let patient: fhir.Patient, match;

  afterEach(cleanup);

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("renders successfully", () => {
    render(
      <BrowserRouter>
        <ContactsCard patient={patient} match={match}></ContactsCard>
      </BrowserRouter>
    );
  });

  it("displays contacts correctly", () => {
    const wrapper = render(
      <BrowserRouter>
        <ContactsCard patient={patient} match={match}></ContactsCard>
      </BrowserRouter>
    );
    expect(wrapper.queryByText(/Mobile/i)).not.toBeNull();
    expect(wrapper.queryByText(/25467388299499/)).not.toBeNull();
  });
});
