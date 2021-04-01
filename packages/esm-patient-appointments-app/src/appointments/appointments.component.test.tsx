import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Appointments from "./appointments.component";

describe("<AppointmentsComponent />", () => {
  it("renders without dying", () => {
    render(
      <BrowserRouter>
        <Appointments />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Appointments" })
    ).toBeInTheDocument();
  });
});
