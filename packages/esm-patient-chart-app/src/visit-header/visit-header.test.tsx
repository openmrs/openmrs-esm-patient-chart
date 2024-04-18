import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useAssignedExtensions,
  useLayoutType,
  useOnClickOutside,
  usePatient,
  useVisit,
  navigate,
  showModal,
  getHistory,
  goBackInHistory,
  launchWorkspace,
} from '@openmrs/esm-framework';
import { mockPatient, mockPatientWithLongName, getByTextWithMarkup } from 'tools';
import { mockCurrentVisit } from '__mocks__';
import VisitHeader from './visit-header.component';
// FIXME: We shouldn't be importing from the internal API.
import { registerWorkspace } from '@openmrs/esm-framework/src/internal';

const mockUseAssignedExtensions = useAssignedExtensions as jest.Mock;
const mockUsePatient = usePatient as jest.Mock;
const mockUseVisit = useVisit as jest.Mock;
const mockUseLayoutType = useLayoutType as jest.Mock;
const mockShowModal = showModal as jest.Mock;
const mockGetHistory = getHistory as jest.Mock;
const mockGoBackInHistory = goBackInHistory as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    age: jest.fn().mockReturnValue('20'),
    getHistory: jest.fn(() => []),
    goBackInHistory: jest.fn(),
    LeftNavMenu: jest.fn().mockImplementation(() => <div>Left Nav Menu</div>),
    translateFrom: (module, key, defaultValue, options) => defaultValue,
    useAssignedExtensions: jest.fn(),
    useOnClickOutside: jest.fn(),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');
  return {
    ...originalModule,
    launchWorkspace: jest.fn(),
  };
});

describe('Visit Header', () => {
  beforeEach(() => {
    mockUseAssignedExtensions.mockReturnValue([{ id: 'someId' }]);
    mockGoBackInHistory.mockClear();
  });

  test('should display visit header and left nav bar hamburger icon', async () => {
    const user = userEvent.setup();

    registerWorkspace({
      name: 'start-visit-workspace-form',
      title: 'Start visit',
      load: jest.fn(),
      moduleName: 'test-module',
    });
    mockUsePatient.mockReturnValue({
      patient: mockPatient,
      isLoading: false,
      error: null,
      patientUuid: mockPatient.id,
    });
    mockUseVisit.mockReturnValue({ isValidating: null, currentVisit: null });
    mockUseLayoutType.mockReturnValue('tablet');

    render(<VisitHeader />);

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
    expect(launchWorkspace).toHaveBeenCalledWith('start-visit-workspace-form');
  });

  test('should display a truncated name when the patient name is very long', async () => {
    mockUsePatient.mockReturnValue({
      patient: mockPatientWithLongName,
      isLoading: false,
      error: null,
      patientUuid: mockPatient.id,
    });
    mockUseVisit.mockReturnValue({ isValidating: null, currentVisit: null });
    mockUseLayoutType.mockReturnValue('desktop');

    render(<VisitHeader />);

    const longNameText = screen.getByText(/^Some very long given name...$/i);
    expect(longNameText).toBeInTheDocument();
    expect(getByTextWithMarkup(/Some very long given name family name\s*20, male/i)).toBeInTheDocument();
  });

  it('should be able to show configurable stop visit button and modal to stop current visit', async () => {
    const user = userEvent.setup();
    mockUsePatient.mockReturnValue({
      patient: mockPatientWithLongName,
      isLoading: false,
      error: null,
      patientUuid: mockPatient.id,
    });
    mockUseVisit.mockReturnValue({ isValidating: false, currentVisit: mockCurrentVisit });
    mockUseLayoutType.mockReturnValue('desktop');

    render(<VisitHeader />);

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
    render(<VisitHeader />);
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);
    expect(goBackInHistory).toHaveBeenCalledWith({ toUrl: 'https://o3.openmrs.org/openmrs/spa/patient/1234/chart' });
  });

  test('close button should navigate to home if no such URL exists in history', async () => {
    const user = userEvent.setup();
    render(<VisitHeader />);
    mockGetHistory.mockReturnValue([
      `https://o3.openmrs.org/openmrs/spa/patient/${mockPatient.id}/chart`,
      `https://o3.openmrs.org/openmrs/spa/patient/${mockPatient.id}/chart/labs`,
    ]);
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);
    expect(navigate).toHaveBeenCalledWith({ to: '${openmrsSpaBase}/home' });
  });
});
