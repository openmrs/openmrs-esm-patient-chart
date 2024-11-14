import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  age,
  getHistory,
  goBackInHistory,
  navigate,
  showModal,
  useAssignedExtensions,
  useLayoutType,
  useOnClickOutside,
  useVisit,
} from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { getByTextWithMarkup, mockPatient, mockPatientWithLongName } from 'tools';
import { mockCurrentVisit } from '__mocks__';
import VisitHeader from './visit-header.component';

const mockAge = jest.mocked(age);
const mockUseAssignedExtensions = jest.mocked(useAssignedExtensions);
const mockUseVisit = jest.mocked(useVisit);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockShowModal = jest.mocked(showModal);
const mockGetHistory = jest.mocked(getHistory);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  launchPatientWorkspace: jest.fn(),
}));

describe('Visit header', () => {
  beforeEach(() => {
    mockAge.mockReturnValue('20');
    mockGetHistory.mockReturnValue([]);
    mockUseAssignedExtensions.mockReturnValue([
      {
        id: 'someId',
        moduleName: '@openmrs/esm-test-module',
        name: 'patient-chart-visit-header',
        meta: {},
        config: null,
      },
    ]);
  });

  test('should display visit header and left nav bar hamburger icon', async () => {
    const user = userEvent.setup();

    mockUseVisit.mockReturnValue({
      activeVisit: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: null,
      mutate: jest.fn(),
    });
    mockUseLayoutType.mockReturnValue('tablet');

    render(<VisitHeader patient={mockPatient} />);

    const headerBanner = screen.getByRole('banner', { name: /OpenMRS/i });
    expect(headerBanner).toBeInTheDocument();
    expect(screen.getByText(/John Wilson/i)).toBeInTheDocument();

    const hamburgerButton = screen.getByRole('button', { name: /Open Menu/i });
    const homeLink = screen.getByRole('link');
    expect(hamburgerButton).toBeInTheDocument();
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/openmrs/spa/home');

    // Should display the leftNavMenu
    await user.click(hamburgerButton);
    const linkElement = screen.getByText(/Left Nav Menu/i);
    expect(linkElement).toBeInTheDocument();

    // Should close the leftNavMenu
    await user.click(linkElement);
    expect(useOnClickOutside).toHaveBeenCalled();

    // Should be able to start a visit
    const startVisitButton = screen.getByRole('button', { name: /Start a visit/i });
    expect(startVisitButton).toBeInTheDocument();

    await user.click(startVisitButton);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form');
  });

  test('should display a truncated name when the patient name is very long', async () => {
    mockUseVisit.mockReturnValue({
      activeVisit: null,
      currentVisit: null,
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: null,
      mutate: jest.fn(),
    });
    mockUseLayoutType.mockReturnValue('small-desktop');

    render(<VisitHeader patient={mockPatientWithLongName} />);

    const longNameText = screen.getByText(/^Some very long given name...$/i);
    expect(longNameText).toBeInTheDocument();
    expect(getByTextWithMarkup(/Some very long given name family name\s*20, male/i)).toBeInTheDocument();
  });

  it('should be able to show configurable stop visit button and modal to stop current visit', async () => {
    const user = userEvent.setup();
    mockUseVisit.mockReturnValue({
      activeVisit: mockCurrentVisit,
      currentVisit: mockCurrentVisit,
      currentVisitIsRetrospective: false,
      error: null,
      isLoading: false,
      isValidating: null,
      mutate: jest.fn(),
    });
    mockUseLayoutType.mockReturnValue('small-desktop');

    render(<VisitHeader patient={mockPatientWithLongName} />);

    // Should be able to end a visit
    const endVisitButton = screen.getByRole('button', { name: /End visit/i });
    expect(endVisitButton).toBeInTheDocument();

    // should launch the form
    await user.click(endVisitButton);
    expect(mockShowModal).toHaveBeenCalledTimes(1);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);
    expect(navigate).toHaveBeenCalled();
  });

  test('close button should navigate back to before the patient chart', async () => {
    const user = userEvent.setup();
    mockGetHistory.mockReturnValue([
      'https://o3.openmrs.org/openmrs/spa/home',
      'https://o3.openmrs.org/openmrs/spa/patient/1234/chart',
      `https://o3.openmrs.org/openmrs/spa/patient/${mockPatient.id}/chart`,
      `https://o3.openmrs.org/openmrs/spa/patient/${mockPatient.id}/chart/labs`,
    ]);
    render(<VisitHeader patient={mockPatient} />);
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);
    expect(goBackInHistory).toHaveBeenCalledWith({ toUrl: 'https://o3.openmrs.org/openmrs/spa/patient/1234/chart' });
  });

  test('close button should navigate to home if no such URL exists in history', async () => {
    const user = userEvent.setup();
    render(<VisitHeader patient={mockPatient} />);
    mockGetHistory.mockReturnValue([
      `https://o3.openmrs.org/openmrs/spa/patient/${mockPatient.id}/chart`,
      `https://o3.openmrs.org/openmrs/spa/patient/${mockPatient.id}/chart/labs`,
    ]);
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);
    expect(navigate).toHaveBeenCalledWith({ to: '${openmrsSpaBase}/home' });
  });
});
