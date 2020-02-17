import React from "react";
import DemographicsCard from "./demographics-card.component";
import { render, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { mockPatient } from "../../../__mocks__/patient.mock";

describe("<DemographicsCard>", () => {
  let patient: fhir.Patient, match;

  afterEach(cleanup);

  beforeEach(() => {
    patient = mockPatient;
    match = { params: {}, isExact: false, path: "/", url: "/" };
  });

  it("renders the correct age for a 55 year old", () => {
    patient.birthDate = createBirthdayYearsAgo(55);
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("55 yr");
  });

  it("renders the correct age for a 55 year old who had their birthday recently", () => {
    patient.birthDate = createBirthdayYearsAgo(55, 4);
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("55 yr");
  });

  it("renders the correct age for a 18 year old", () => {
    patient.birthDate = createBirthdayYearsAgo(18);
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("18 yr");
  });

  it("renders the correct age for a 17 year old who had their birthday three months ago", () => {
    patient.birthDate = createBirthdayYearsAgo(17, 3);
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("17 yr 3 mo");
  });

  it("renders the correct age for a 17 year old who had their birthday three months and one day ago", () => {
    patient.birthDate = createBirthdayYearsAgo(17, 3, 1);
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("17 yr 3 mo");
  });

  it("renders the correct age for a 17 year old who had their birthday almost three months ago", () => {
    patient.birthDate = createBirthdayYearsAgo(17, 2, 27);
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("17 yr 2 mo");
  });

  it("renders the correct age for a 16 week old baby", () => {
    patient.birthDate = createBirthdayWeeksAgo(16);
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("16 week");
  });

  it("renders the correct age for a 16 week and 1 day old baby", () => {
    patient.birthDate = createBirthdayWeeksAgo(16, 1);
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("16 wk 1 d");
  });

  it("renders the correct age for a baby born in the last month", () => {
    patient.birthDate = createBirthdayWeeksAgo(0, 15);
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("15 day");
  });

  it("renders the correct age for a baby born today", () => {
    patient.birthDate = createBirthdayWeeksAgo(0, 0);
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("Today");
  });

  it("renders the correct age for a baby born two days ago", () => {
    patient.birthDate = createBirthdayWeeksAgo(0, 2);
    const { getByTitle } = render(
      <BrowserRouter>
        <DemographicsCard match={match} patient={patient} />
      </BrowserRouter>
    );
    expect(getByTitle("Age").textContent).toBe("2 day");
  });
});

function createBirthdayYearsAgo(years, months = 0, days = 0): string {
  const currentDate = new Date();
  const birthdayAgoDate = new Date(
    currentDate.getUTCFullYear() - years,
    currentDate.getUTCMonth() - months,
    currentDate.getUTCDate() - days
  );
  const fullString = birthdayAgoDate.toISOString();
  return fullString.slice(0, fullString.indexOf("T"));
}

function createBirthdayWeeksAgo(weeks, days = 0) {
  const today = new Date();
  const weeksAgo = weeks * 604800000;
  const daysAgo = days * 86400000;
  const birthDate = new Date(today.getTime() - weeksAgo - daysAgo);
  const birthDateISO = birthDate.toISOString();
  return birthDateISO.slice(0, birthDateISO.indexOf("T"));
}
