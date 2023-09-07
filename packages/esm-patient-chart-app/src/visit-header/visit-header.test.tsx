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
} from '@openmrs/esm-framework';
import { registerWorkspace, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mockPatient, mockPatientWithLongName, getByTextWithMarkup } from '../../../../tools/test-helpers';
import { mockCurrentVisit } from '../__mocks__/visits.mock';
import VisitHeader from './visit-header.component';

const mockUseAssignedExtensions = useAssignedExtensions as jest.Mock;
const mockUsePatient = usePatient as jest.Mock;
const mockUseVisit = useVisit as jest.Mock;
const mockUseLayoutType = useLayoutType as jest.Mock;
const mockExtensionRegistry = {};
const mockShowModal = showModal as jest.Mock;
const mockNavigateBack = jest.fn();

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    usePatient: jest.fn(),
    useAssignedExtensions: jest.fn(),
    age: jest.fn(() => 20),
    LeftNavMenu: jest.fn().mockImplementation(() => <div>Left Nav Menu</div>),
    useVisit: jest.fn(),
    registerExtension: (ext) => {
      mockExtensionRegistry[ext.name] = ext;
    },
    getExtensionRegistration: (name) => mockExtensionRegistry[name],
    translateFrom: (module, key, defaultValue, options) => defaultValue,
    useOnClickOutside: jest.fn(),
    showModal: jest.fn(),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');
  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    navigate: jest.fn(),
  };
});

describe('Visit Header', () => {
  beforeEach(() => {
    window.history.back = mockNavigateBack;
  });

  test('should display visit header and left nav bar hamburger icon', async () => {
    const user = userEvent.setup();

    registerWorkspace({ name: 'start-visit-workspace-form', title: 'Start visit', load: jest.fn() });
    mockUseAssignedExtensions.mockReturnValue([{ id: 'someId' }]);
    mockUsePatient.mockReturnValue({
      patient: mockPatient,
      isLoading: false,
      error: null,
      patientUuid: mockPatient.id,
    });
    mockUseVisit.mockReturnValue({ isValidating: null, currentVisit: null });
    mockUseLayoutType.mockReturnValue('tablet');

    renderVisitHeader();

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
    expect(launchPatientWorkspace).toHaveBeenCalled();
    expect(launchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form');

    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();

    // Should close the visit-header
    await user.click(closeButton);
    expect(navigate).toHaveBeenCalledWith({ to: '/spa/home' });
    expect(window.history.back).not.toHaveBeenCalled();

    Object.defineProperty(document, 'referrer', { value: 'some-uuid', configurable: true });
    await user.click(closeButton);
    expect(window.history.back).toHaveBeenCalled();
    expect(mockNavigateBack).toHaveBeenCalled();
  });

  test('should display a truncated name when the patient name is very long', async () => {
    mockUseAssignedExtensions.mockReturnValue([{ id: 'someId' }]);
    mockUsePatient.mockReturnValue({
      patient: mockPatientWithLongName,
      isLoading: false,
      error: null,
      patientUuid: mockPatient.id,
    });
    mockUseVisit.mockReturnValue({ isValidating: null, currentVisit: null });
    mockUseLayoutType.mockReturnValue('desktop');

    renderVisitHeader();

    const longNameText = screen.getByText(/^Some very long given name...$/i);
    expect(longNameText).toBeInTheDocument();
    expect(getByTextWithMarkup(/Some very long given name family name\s*20, male/i)).toBeInTheDocument();
  });

  it('should be able to show configurable stop visit button and modal to stop current visit', async () => {
    const user = userEvent.setup();
    mockUseAssignedExtensions.mockReturnValue([{ id: 'someId' }]);
    mockUsePatient.mockReturnValue({
      patient: mockPatientWithLongName,
      isLoading: false,
      error: null,
      patientUuid: mockPatient.id,
    });
    mockUseVisit.mockReturnValue({ isValidating: false, currentVisit: mockCurrentVisit });
    mockUseLayoutType.mockReturnValue('desktop');

    renderVisitHeader();

    // Should be able to end a visit
    const endVisitButton = screen.getByRole('button', { name: /End visit/i });
    expect(endVisitButton).toBeInTheDocument();

    // should launch the form
    await user.click(endVisitButton);
    expect(mockShowModal).toHaveBeenCalledTimes(1);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();

    // Should close the visit-header
    await user.click(closeButton);
    expect(navigate).toHaveBeenCalledWith({ to: '/spa/home' });
  });
});

function renderVisitHeader() {
  render(<VisitHeader />);
}
