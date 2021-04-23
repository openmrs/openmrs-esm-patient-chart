import React from "react";
import VaccinationRow from "./vaccination-row.component";
import { render, within, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

const match = { params: {}, isExact: false, path: "/", url: "/" };

const renderVaccinationRow = (immunization) => {
  const tbody = document.createElement("tbody");
  render(
    <BrowserRouter>
      <VaccinationRow immunization={immunization} />
    </BrowserRouter>,
    { container: document.body.appendChild(tbody) }
  );
};

describe("<VaccinationRow />", () => {
  it("should show just vaccine name and add button when no doses are given", async () => {
    const immunization = {
      vaccineName: "Rotavirus",
      existingDoses: [],
    };

    renderVaccinationRow(immunization);

    await screen.findByText("Rotavirus");
    const vaccinationRow = screen.getByRole("row", { name: /Rotavirus +/ });
    const expandButton = screen.getByRole("button", { name: "+" });

    expect(expandButton).toBeTruthy();
    expect(within(vaccinationRow).getByText("Rotavirus")).toBeTruthy();
    expect(within(vaccinationRow).getByText("+")).toBeTruthy();
  });

  it("should show vaccine name with expand button and recent vaccination date when existing doses are present", async () => {
    const immunization = {
      vaccineName: "Rotavirus",
      existingDoses: [
        {
          series: "4 Months",
          occurrenceDateTime: "2019-06-18",
          doseNumberPositiveInt: 1,
          expirationDate: "2019-06-18",
        },
        {
          series: "2 Months",
          occurrenceDateTime: "2018-06-18",
          doseNumberPositiveInt: 1,
          expirationDate: "2018-06-18",
        },
      ],
    };

    renderVaccinationRow(immunization);

    await screen.findByText("Rotavirus");
    const vaccinationRow = screen.getByRole("row", { name: /Rotavirus +/ });
    const expandButton = screen.getByRole("button", { name: "+" });

    expect(expandButton).toBeTruthy();
    expect(within(vaccinationRow).getByText("Rotavirus")).toBeTruthy();
    expect(
      within(vaccinationRow).getByText("Single Dose on 18-Jun-2019")
    ).toBeTruthy();
    expect(within(vaccinationRow).getByText("+")).toBeTruthy();
  });

  it("should show vaccine all doses of vaccine along with recent vaccination date when expanded", async () => {
    const immunization = {
      vaccineName: "Rotavirus",
      sequences: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 },
      ],
      existingDoses: [
        {
          sequenceLabel: "4 Months",
          occurrenceDateTime: "2019-05-18",
          doseNumberPositiveInt: 2,
          expirationDate: "2019-06-18",
        },
        {
          sequenceLabel: "2 Months",
          occurrenceDateTime: "2018-05-18",
          doseNumberPositiveInt: 1,
          expirationDate: "2018-06-18",
        },
      ],
    };

    renderVaccinationRow(immunization);

    await screen.findByText("Rotavirus");
    const vaccinationRow = screen.getByRole("row", { name: /Rotavirus +/ });
    const expandButton = screen.getByRole("button", { name: "+" });

    fireEvent.click(expandButton);

    await screen.findByText(/4 Months/i);
  });
});
