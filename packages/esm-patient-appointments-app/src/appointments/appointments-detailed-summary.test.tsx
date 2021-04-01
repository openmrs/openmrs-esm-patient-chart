import React from "react";
import AppointmentsDetailedSummary from "./appointments-detailed-summary.component";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { mockAppointmentsResponse } from "../../../__mocks__/appointments.mock";
import { getAppointments } from "./appointments.resource";
import { openWorkspaceTab } from "../shared-utils";

const mockOpenWorkspaceTab = openWorkspaceTab as jest.Mock;
const mockGetAppointments = getAppointments as jest.Mock;
const mockPatientAppointments = getAppointments as jest.Mock;

const renderAppointmentsDetailedSummary = () => {
  render(
    <BrowserRouter>
      <AppointmentsDetailedSummary />
    </BrowserRouter>
  );
};

dayjs.extend(utc);

jest.mock("./appointments.resource", () => ({
  getAppointments: jest.fn()
}));

jest.mock("../shared-utils", () => ({
  openWorkspaceTab: jest.fn()
}));

describe("<AppointmentsDetailedSummary />", () => {
  beforeEach(() => {
    mockOpenWorkspaceTab.mockReset;
    mockPatientAppointments.mockReset;
    mockGetAppointments.mockReset;
  });

  it("should display a detailed summary of the patient's appointments if present", async () => {
    mockGetAppointments.mockReturnValue(
      Promise.resolve(mockAppointmentsResponse)
    );
    renderAppointmentsDetailedSummary();

    await screen.findByText("Appointments");

    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Start time")).toBeInTheDocument();
    expect(screen.getByText("End time")).toBeInTheDocument();
    expect(screen.getByText("Service type")).toBeInTheDocument();
    expect(screen.getByText("Appointment type")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("2020-Mar-08")).toBeInTheDocument();
    expect(screen.getByText("08:30 AM")).toBeInTheDocument();
    expect(screen.getByText("08:45 AM")).toBeInTheDocument();
    expect(screen.getByText("Triage")).toBeInTheDocument();
    expect(screen.getAllByText("WalkIn").length).toBe(2);
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText("2020-Mar-15")).toBeInTheDocument();
    expect(screen.getByText("11:00 AM")).toBeInTheDocument();
    expect(screen.getByText("11:10 AM")).toBeInTheDocument();
    expect(screen.getByText("Consultation")).toBeInTheDocument();
    expect(screen.getByText("Unscheduled")).toBeInTheDocument();
  });

  it("renders an empty state view when appointments data is absent", async () => {
    mockGetAppointments.mockReturnValue(Promise.resolve([]));

    renderAppointmentsDetailedSummary();

    await screen.findByText("Appointments");

    expect(screen.getByText("Appointments")).toBeInTheDocument();

    expect(
      screen.getByText(/There are no appointments to display for this patient/)
    ).toBeInTheDocument();
  });
});
