import React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/react';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import FormsList from './forms-list.component';
import { mockFormsSection } from '../../../../../__mocks__/forms-list.mock';

const testProps = {
  patientUuid: 'patientUuid',
  patient: { id: 'patientUuid' },
  visit: {
    uuid: '17f512b4-d264-4113-a6fe-160cb38cb46e',
    encounters: [],
    visitType: {
      uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
      name: 'Facility Visit',
      display: 'Facility Visit',
    },
    startDatetime: '2021-03-16T08:16:00.000+0000',
  },
  formsSection: mockFormsSection,
  searchTerm: '',
  pageSize: 10000,
  undefined,
};

const mockedUseLayoutType = useLayoutType as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    usePagination: jest.fn().mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: mockFormsSection.completedFromsInfo,
    })),
  };
});

let container;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

describe('<FormsList/>', () => {
  test('should display a list of forms', () => {
    mockedUseLayoutType.mockReturnValue('tablet');

    renderFormsDashboard();

    expect(screen.getByRole('heading', { name: /Section Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Last completed/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Display Form 1/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Display Form 2/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Display Form 3 01-Jan-2022, 10:00 AM/i })).toBeInTheDocument();
  });
});

describe('<FormsList/>', () => {
  test('should not display a list of forms', () => {
    mockedUseLayoutType.mockReturnValue('tablet');
    mockUsePagination.mockReturnValue([]);

    renderFormsDashboard();

    expect(screen.getByText(/There are no forms to display/i)).toBeInTheDocument();
  });
});

function renderFormsDashboard() {
  act(() => {
    ReactDOM.createRoot(container).render(<FormsList {...testProps} />);
  });
}
