import React from "react";
import AppointmentRecord from "./appointment-record.component";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { mockAppointmentResponse } from "../../../__mocks__/appointments.mock";
import { getAppointmentsByUuid } from "./appointments.resource";

const mockGetAppointmentsByUuid = getAppointmentsByUuid as jest.Mock;

dayjs.extend(utc);

jest.mock("./appointments.resource", () => ({
  getAppointments: jest.fn(),
  getAppointmentsByUuid: jest.fn()
}));

jest.mock("../shared-utils", () => ({
  openWorkspaceTab: jest.fn()
}));

describe("<AppointmentRecord />", () => {
  const match = {
    params: {
      appointmentUuid: "68ab2e6e-7af7-4b2c-bd6f-7e2ecf30faee"
    },
    isExact: true,
    url: "/",
    path:
      "/patient/64cb4894-848a-4027-8174-05c52989c0ca/chart/appointments/details/:appointmentUuid"
  };

  beforeEach(() => {
    mockGetAppointmentsByUuid.mockReset;
  });

  it("should display a detailed summary of the selected appointment record", async () => {
    mockGetAppointmentsByUuid.mockReturnValue(
      Promise.resolve(mockAppointmentResponse)
    );

    render(
      <BrowserRouter>
        <AppointmentRecord match={match} />
      </BrowserRouter>
    );

    await screen.findByText("Appointment");

    expect(screen.getByText("Appointment")).toBeInTheDocument();

    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("2020-Mar-23")).toBeInTheDocument();
    expect(screen.getByText("Start time")).toBeInTheDocument();
    expect(screen.getByText("07:35 AM")).toBeInTheDocument();
    expect(screen.getByText("End time")).toBeInTheDocument();
    expect(screen.getByText("07:50 AM")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
    expect(screen.getByText("Service type")).toBeInTheDocument();
    expect(screen.getByText("Appointment type")).toBeInTheDocument();
    expect(screen.getByText("WalkIn")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Last updated")).toBeInTheDocument();
    expect(screen.getByText("Last updated by")).toBeInTheDocument();
    expect(screen.getByText("Last updated location")).toBeInTheDocument();
    expect(screen.getByText("23-Mar-2020")).toBeInTheDocument();
  });
});
