import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithSwr } from 'tools';
import FormsList, { type FormsListProps } from './forms-list.component';

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

const defaultProps: FormsListProps & { reset: () => void } = {
  completedForms: [],
  handleFormOpen: jest.fn(),
  reset() {
    this.completedForms = [];
  },
};

function renderFormsList(props = {}) {
  renderWithSwr(<FormsList {...defaultProps} {...props} />);
}

beforeEach(async () => {
  defaultProps.reset();
});

it('renders a list of forms fetched from the server', async () => {
  const user = userEvent.setup();

  renderFormsList({ completedForms: forms.map((form) => ({ form, associatedEncounters: [] })) });

  const searchbox = screen.getByRole('searchbox');
  expect(searchbox).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /clear search input/i })).toBeInTheDocument();
  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(screen.getByRole('cell', { name: /Laboratory Tests/i })).toBeInTheDocument();
  expect(screen.queryByText('PiusRocks')).not.toBeInTheDocument();

  const expectedColumnHeaders = [/form name \(A-Z\)/, /last completed/];

  expectedColumnHeaders.forEach((header) =>
    expect(
      within(screen.getByRole('table')).getByRole('columnheader', { name: new RegExp(header, 'i') }),
    ).toBeInTheDocument(),
  );

  const expectedTableRows = [/laboratory tests never/, /surgical operation never/, /test form 1 never/];

  expectedTableRows.map((row) =>
    expect(within(screen.getByRole('table')).getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument(),
  );

  await user.clear(searchbox);
  await user.type(searchbox, 'lab');

  expect(screen.getByRole('row', { name: /laboratory tests never/i })).toBeInTheDocument();
});

const forms = [
  {
    uuid: '4077b82a-6d5b-4fc6-abb9-8bc6846600f0',
    name: 'BirthTest',
    display: 'BirthTest',
    encounterType: {
      uuid: '0e8230ce-bd1d-43f5-a863-cf44344fa4b0',
      name: 'Adult Visit',
      viewPrivilege: null,
      editPrivilege: { uuid: 'd7a611f3-3c88-406e-8f7c-ecf13d0891dc', name: 'Edit Form' },
    },
    version: '1.0.2',
    published: false,
    retired: false,
    resources: [
      {
        uuid: 'd8c78580-538e-4c8c-8a7c-a31d07318602',
        name: 'JSON schema',
        dataType: 'AmpathJsonSchema',
        valueReference: '50d9f3ba-437c-444f-b675-fdda8052aefb',
      },
    ],
  },
  {
    uuid: '9e1a0c68-ca19-3482-9ffb-0a6b4e591c2a',
    name: 'Covid 19',
    display: 'Covid 19',
    encounterType: {
      uuid: 'dd528487-82a5-4082-9c72-ed246bd49591',
      name: 'Consultation',
      viewPrivilege: null,
      editPrivilege: { uuid: 'd7a611f3-3c88-406e-8f7c-ecf13d0891dc', name: 'Edit Form' },
    },
    version: '1',
    published: false,
    retired: false,
    resources: [
      {
        uuid: '7d51a728-edbc-492b-aaf2-bea4d0d0e7db',
        name: 'JSON schema',
        dataType: 'AmpathJsonSchema',
        valueReference: 'a2374100-7398-4eb2-b39e-5cb3f50230a8',
      },
    ],
  },
  {
    uuid: '336e13c6-0042-356e-9773-252382a3c7be',
    name: 'Laboratory Tests',
    display: 'Laboratory Tests',
    encounterType: {
      uuid: 'dd528487-82a5-4082-9c72-ed246bd49591',
      name: 'Consultation',
      viewPrivilege: null,
      editPrivilege: { uuid: 'd7a611f3-3c88-406e-8f7c-ecf13d0891dc', name: 'Edit Form' },
    },
    version: '2',
    published: true,
    retired: false,
    resources: [
      {
        uuid: '4bb4222b-4eb1-4e13-9730-dab367360ac1',
        name: 'JSON schema',
        dataType: 'AmpathJsonSchema',
        valueReference: 'e8525f5e-98e8-4599-8f53-8cd80679a225',
      },
    ],
  },
  {
    uuid: '96637f12-3c04-311f-b477-3fa6a866e895',
    name: 'Surgical Operation',
    display: 'Surgical Operation',
    encounterType: {
      uuid: 'dd528487-82a5-4082-9c72-ed246bd49591',
      name: 'Consultation',
      viewPrivilege: null,
      editPrivilege: null,
    },
    version: '1',
    published: true,
    retired: false,
    resources: [
      {
        uuid: '7b725cfd-4391-4e80-a9c3-aaee9ce7f5cd',
        name: 'JSON schema',
        dataType: 'AmpathJsonSchema',
        valueReference: '75b5fe60-b529-4d7b-9c40-cbc72fc3e05f',
      },
    ],
  },
  {
    uuid: '2ddde996-b1c3-37f1-a53e-378dd1a4f6b5',
    name: 'Test Form 1',
    display: 'Test Form 1',
    encounterType: {
      uuid: 'dd528487-82a5-4082-9c72-ed246bd49591',
      name: 'Consultation',
      viewPrivilege: null,
      editPrivilege: null,
    },
    version: '1',
    published: true,
    retired: false,
    resources: [
      {
        uuid: '3214f6db-4da6-488a-b4eb-e6c9aabdbacb',
        name: 'JSON schema',
        dataType: 'AmpathJsonSchema',
        valueReference: '56b08772-3145-428d-946d-4bb6455783ed',
      },
      {
        uuid: '6381a458-9504-418a-b3fe-2e023e6d2550',
        name: 'Test Form 1_translations_fr',
        dataType: 'org.openmrs.customdatatype.datatype.LongFreeTextDatatype',
        valueReference: '96c0472d-240f-4dc4-b63d-f5bfb90afa25',
      },
    ],
  },
];
