import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useVisitTypes } from '@openmrs/esm-framework';
import { mockVisitTypes } from '__mocks__';
import BaseVisitType from './base-visit-type.component';

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

const mockUseVisitTypes = useVisitTypes as jest.Mock;
const mockGoToPage = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useVisitTypes: jest.fn(),
}));

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: jest.fn().mockImplementation(() => ({
    handleSubmit: () => jest.fn(),
    control: {
      register: jest.fn(),
      unregister: jest.fn(),
      getFieldState: jest.fn(),
      _names: {
        array: new Set('test'),
        mount: new Set('test'),
        unMount: new Set('test'),
        watch: new Set('test'),
        focus: 'test',
        watchAll: false,
      },
      _subjects: {
        watch: jest.fn(),
        array: jest.fn(),
        state: jest.fn(),
      },
      _getWatch: jest.fn(),
      _formValues: [],
      _defaultValues: [],
    },
    getValues: () => {
      return [];
    },
    setValue: () => jest.fn(),
    formState: () => jest.fn(),
    watch: () => jest.fn(),
  })),
  Controller: ({ render }) =>
    render({
      field: {
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: '',
        ref: jest.fn(),
      },
      formState: {
        isSubmitted: false,
      },
      fieldState: {
        isTouched: false,
      },
    }),
  useSubscribe: () => ({
    r: { current: { subject: { subscribe: () => jest.fn() } } },
  }),
}));

describe('VisitTypeOverview', () => {
  const renderVisitTypeOverview = () => {
    mockUseVisitTypes.mockReturnValue(mockVisitTypes);
    render(<BaseVisitType visitTypes={mockVisitTypes} />);
  };

  it('should be able to search for a visit type', async () => {
    const user = userEvent.setup();

    renderVisitTypeOverview();

    const hivVisit = screen.getByRole('radio', { name: /HIV Return Visit/i });
    const outpatientVisit = screen.getByRole('radio', { name: /Outpatient Visit/i });

    expect(outpatientVisit).toBeInTheDocument();
    expect(hivVisit).toBeInTheDocument();

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'HIV');

    expect(outpatientVisit).toBeEmptyDOMElement();
    expect(hivVisit).toBeInTheDocument();
  });
});
