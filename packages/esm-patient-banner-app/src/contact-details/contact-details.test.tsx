import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { renderWithSwr, waitForLoadingToFinish } from 'tools';
import { usePatientAttributes, usePatientContactAttributes } from '../hooks/usePatientAttributes';
import { usePatientListsForPatient } from '../hooks/usePatientListsForPatient';
import ContactDetails from './contact-details.component';

const mockedUsePatientAttributes = usePatientAttributes as jest.Mock;
const mockedUsePatientContactAttributes = usePatientContactAttributes as jest.Mock;
const mockUsePatientListsForPatient = usePatientListsForPatient as jest.Mock;

const testProps = {
  address: [
    {
      city: 'Foo',
      country: 'Bar',
      id: '0000',
      postalCode: '00100',
      state: 'Quux',
      use: 'home',
    },
  ],
  telecom: [{ value: '+0123456789' }],
  patientId: '1111',
  deceased: false,
  isTabletViewport: false,
};

const mockRelationships = [
  {
    display: 'Amanda is the Sibling of John',
    uuid: '993bc79d-5ca5-4c76-b4b3-adf49e25bd0b',
    personA: {
      uuid: '07006bcb-91d4-4c57-a5f7-49751899d9b5',
      display: '100ADT - Amanda Robinson',
      age: 24,
    },
    personB: {
      uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
      display: '100GEJ - John Wilson',
      age: 49,
    },
    relationshipType: {
      uuid: '8d91a01c-c2cc-11de-8d13-0010c6dffd0f',
      display: 'Sibling/Sibling',
      description: 'Relationship between brother/sister, brother/brother, and sister/sister',
      aIsToB: 'Sibling',
      bIsToA: 'Sibling',
    },
  },
];

const mockPersonAttributes = [
  {
    display: 'Next of Kin Contact Phone Number = 0000000000',
    uuid: '1de1ac71-68e8-4a08-a7e2-5042093d4e46',
    value: '0700-000-000',
    attributeType: {
      uuid: 'a657a4f1-9c0f-444b-a1fd-445bb91dd12d',
      display: 'Next of Kin Contact Phone Number',
    },
  },
];

const mockCohorts = [
  {
    uuid: 'fdc95682-e206-421b-9534-e2a4010cc05d',
    name: 'List three',
    startDate: '2023-04-19T23:26:27.000+0000',
    endDate: null,
  },
  {
    uuid: '1d48bec7-6aab-464c-ac16-687ba46e7812',
    name: ' Test patient List-47',
    startDate: '2023-04-24T23:28:49.000+0000',
    endDate: null,
  },
  {
    uuid: '6ce81b61-387d-43ab-86fb-606fa16d39dd',
    name: ' Test patient List-41',
    startDate: '2023-04-24T23:28:49.000+0000',
    endDate: null,
  },
  {
    uuid: '1361caf0-b3c3-4937-88e3-40074f7f3320',
    name: 'Potential Patients',
    startDate: '2023-06-07T15:40:00.000+0000',
    endDate: null,
  },
];
const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('../hooks/usePatientAttributes', () => ({
  usePatientAttributes: jest.fn(),
  usePatientContactAttributes: jest.fn(),
}));

jest.mock('../hooks/usePatientListsForPatient', () => ({
  usePatientListsForPatient: jest.fn(),
}));

describe('ContactDetails', () => {
  it("renders the patient's address, contact details, patient lists, and relationships when available", async () => {
    mockedUsePatientAttributes.mockReturnValue({
      isLoading: false,
      attributes: [],
      error: null,
    });

    mockedUsePatientContactAttributes.mockReturnValueOnce({
      isLoading: false,
      contactAttributes: mockPersonAttributes,
    });

    mockUsePatientListsForPatient.mockReturnValueOnce({
      isLoading: false,
      cohorts: mockCohorts,
    });

    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockRelationships } });

    renderContactDetails();

    await waitForLoadingToFinish();

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText(/Amanda Robinson/)).toBeInTheDocument();
    expect(screen.getByText(/Sibling/i)).toBeInTheDocument();
    expect(screen.getByText(/24 yrs/i)).toBeInTheDocument();
    expect(screen.getByText(/\+0123456789/i)).toBeInTheDocument();
    expect(screen.getByText(/Next of Kin Contact Phone Number/i)).toBeInTheDocument();
    expect(screen.getByText(/0700-000-000/)).toBeInTheDocument();
    expect(screen.getByText(/Patient Lists/)).toBeInTheDocument();
    expect(screen.getByText(/Test patient List-47/)).toBeInTheDocument();
    expect(screen.getByText(/List three/)).toBeInTheDocument();
  });

  it('renders the contact details with 2 columns if banner width is small', async () => {
    mockedUsePatientAttributes.mockReturnValue({
      isLoading: false,
      attributes: [],
      error: null,
    });

    mockedUsePatientContactAttributes.mockReturnValueOnce({
      isLoading: false,
      contactAttributes: mockPersonAttributes,
    });

    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockRelationships } });

    mockUsePatientListsForPatient.mockReturnValueOnce({
      isLoading: false,
      cohorts: mockCohorts,
    });
    const props = { ...testProps, isTabletViewport: true };

    const { container } = renderWithSwr(<ContactDetails {...props} />);

    await waitForLoadingToFinish();

    expect(container.firstChild).toHaveClass('tabletSizeBanner');
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText(/Amanda Robinson/)).toBeInTheDocument();
    expect(screen.getByText(/Sibling/i)).toBeInTheDocument();
    expect(screen.getByText(/24 yrs/i)).toBeInTheDocument();
    expect(screen.getByText(/Next of Kin Contact Phone Number/i)).toBeInTheDocument();
    expect(screen.getByText(/0700-000-000/)).toBeInTheDocument();
    expect(screen.getByText(/Patient Lists/)).toBeInTheDocument();
  });

  it('renders the contact details with 4 colummns if banner width is large', async () => {
    mockedUsePatientAttributes.mockReturnValue({
      isLoading: false,
      attributes: [],
      error: null,
    });

    mockedUsePatientContactAttributes.mockReturnValueOnce({
      isLoading: false,
      contactAttributes: mockPersonAttributes,
    });

    mockUsePatientListsForPatient.mockReturnValueOnce({
      isLoading: false,
      cohorts: mockCohorts,
    });

    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockRelationships } });
    const props = { ...testProps, isTabletViewport: false };

    const { container } = renderWithSwr(<ContactDetails {...props} />);

    await waitForLoadingToFinish();

    expect(container.firstChild).not.toHaveClass('tabletSizeBanner');
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText(/Amanda Robinson/)).toBeInTheDocument();
    expect(screen.getByText(/Sibling/i)).toBeInTheDocument();
    expect(screen.getByText(/24 yrs/i)).toBeInTheDocument();
    expect(screen.getByText(/Next of Kin Contact Phone Number/i)).toBeInTheDocument();
    expect(screen.getByText(/0700-000-000/)).toBeInTheDocument();
  });

  it('renders an empty state view when contact details, relations, patient lists and addresses are not available', async () => {
    mockedUsePatientAttributes.mockReturnValue({
      isLoading: false,
      attributes: [],
      error: null,
    });

    mockedUsePatientContactAttributes.mockReturnValueOnce({
      isLoading: false,
      contactAttributes: [],
    });

    mockUsePatientListsForPatient.mockReturnValueOnce({
      isLoading: false,
      cohorts: [],
    });

    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderWithSwr(
      <ContactDetails
        address={null}
        telecom={null}
        patientId={'some-uuid'}
        isTabletViewport={false}
        deceased={false}
      />,
    );

    await waitForLoadingToFinish();

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getByText(/Patient Lists/)).toBeInTheDocument();
    expect(screen.getAllByText('--').length).toBe(4);
  });
});

function renderContactDetails() {
  renderWithSwr(<ContactDetails {...testProps} />);
}
