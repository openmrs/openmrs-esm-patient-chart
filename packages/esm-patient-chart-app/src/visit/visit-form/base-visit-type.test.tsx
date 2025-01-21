import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { useVisitTypes } from '@openmrs/esm-framework';
import { mockVisitTypes } from '__mocks__';
import BaseVisitType from './base-visit-type.component';

jest.mock('lodash-es/debounce', () => jest.fn((fn) => fn));

const mockUseVisitTypes = jest.mocked(useVisitTypes);

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

  it('renders a list of the available visit types', () => {
    renderVisitTypeOverview();

    mockVisitTypes.forEach((visitType) => {
      const radio = screen.getByRole('radio', { name: new RegExp(visitType.display, 'i') });
      expect(radio).toBeInTheDocument();
      expect(radio).not.toBeChecked();
    });
  });

  it('allows keyboard navigation through visit types', async () => {
    const user = userEvent.setup();

    renderVisitTypeOverview();

    const firstVisitType = screen.getByRole('radio', { name: new RegExp(mockVisitTypes[0].display, 'i') });
    firstVisitType.focus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: new RegExp(mockVisitTypes[1].display, 'i') })).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(firstVisitType).toHaveFocus();
  });

  it('clears the search input when the clear button is clicked', async () => {
    const user = userEvent.setup();

    renderVisitTypeOverview();

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'HIV');

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(searchInput).toHaveValue('');
    mockVisitTypes.forEach((visitType) => {
      expect(screen.getByRole('radio', { name: new RegExp(visitType.display, 'i') })).toBeInTheDocument();
    });
  });

  it('searches for a matching visit type when the user types in the search input', async () => {
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

  it('renders an empty state when a search yields no matching results', async () => {
    const user = userEvent.setup();

    renderVisitTypeOverview();

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'NonexistentVisitType');

    expect(screen.getByText(/no visit types to display/i)).toBeInTheDocument();
    expect(screen.getByText(/check the filters above/i)).toBeInTheDocument();
  });

  it('selects a visit type when clicked', async () => {
    const user = userEvent.setup();

    renderVisitTypeOverview();

    const hivVisit = screen.getByRole('radio', { name: /HIV Return Visit/i });
    await user.click(hivVisit);

    expect(hivVisit).toBeChecked();
  });
});
