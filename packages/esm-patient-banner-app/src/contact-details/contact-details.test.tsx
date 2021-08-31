import React from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { fetchPatientRelationships } from './relationships.resource';
import ContactDetails from './contact-details.component';

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
};

const mockRelationships = [
  {
    uuid: 1111,
    display: 'Amanda Testerson',
    relativeAge: 30,
    relativeUuid: 2222,
    relationshipType: 'Cousin',
  },
];

const mockFetchPatientRelationships = fetchPatientRelationships as jest.Mock;

jest.mock('./relationships.resource', () => ({
  fetchPatientRelationships: jest.fn(),
}));

describe('ContactDetails: ', () => {
  it("shows the patient's contact details and relationships when available", async () => {
    mockFetchPatientRelationships.mockResolvedValue(mockRelationships);

    renderContactDetails();

    await waitForLoadingToFinish();

    screen.findByText('Relationships');
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText('Amanda Testerson')).toBeInTheDocument();
    expect(screen.getByText(/Cousin/i)).toBeInTheDocument();
    expect(screen.getByText(/30 yrs/i)).toBeInTheDocument();
  });

  it('shows an empty state when relationships data is not available', async () => {
    mockFetchPatientRelationships.mockResolvedValue([]);

    renderContactDetails();

    await waitForLoadingToFinish();

    screen.findByText('Relationships');
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});

function renderContactDetails() {
  render(<ContactDetails {...testProps} />);
}

function waitForLoadingToFinish() {
  waitForElementToBeRemoved(() => [...screen.queryAllByRole(/progressbar/i, ...screen.queryAllByText(/loading/i))], {
    timeout: 4000,
  });
}
