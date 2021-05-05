import React from 'react';
import ContactDetails from './contact-details.component';
import { render, screen } from '@testing-library/react';
import { fetchPatientRelationships } from './relationships.resource';

const mockFetchPatientRelationships = fetchPatientRelationships as jest.Mock;

jest.mock('./relationships.resource', () => ({
  fetchPatientRelationships: jest.fn(),
}));

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

function renderContactDetails() {
  render(<ContactDetails {...testProps} />);
}

it("displays the patient's contact details", async () => {
  mockFetchPatientRelationships.mockReturnValue(
    Promise.resolve({
      data: {
        results: [
          {
            uuid: 2222,
            personA: {
              person: { display: 'Amanda Testerson', age: 30 },
              uuid: 2222,
            },
            relationshipType: { aIsToB: 'Cousin' },
          },
        ],
      },
    }),
  );

  renderContactDetails();

  await screen.findByText('Relationships');
  expect(screen.getByText('Address')).toBeInTheDocument();
  expect(screen.getByText('Contact Details')).toBeInTheDocument();
  expect(screen.getByText('Relationships')).toBeInTheDocument();
  expect(screen.getByText('Amanda Testerson')).toBeInTheDocument();
  expect(screen.getByText(/Cousin/i)).toBeInTheDocument();
});
