import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderTag } from './tag.component';
import { type ConfigConcepts, type Encounter, type Observation } from '../types';

describe('Tag component', () => {
  const mockConfig: ConfigConcepts = {
    trueConceptUuid: 'true-uuid',
    falseConceptUuid: 'false-uuid',
    otherConceptUuid: 'other-uuid',
  };

  const mockStatusColorMappings = {
    'status-uuid-1': 'green',
    'status-uuid-2': 'red',
  };

  const createMockEncounter = (obsValue: Observation['value']): Encounter => ({
    uuid: 'encounter-uuid',
    encounterDatetime: '2024-01-01',
    encounterType: {
      uuid: 'encounter-type-uuid',
      name: 'Test Encounter',
    },
    obs: [
      {
        uuid: 'obs-uuid',
        concept: {
          uuid: 'test-concept-uuid',
          name: 'Test Concept',
        },
        value: obsValue,
        obsDatetime: '2024-01-01',
      },
    ],
    encounterProviders: [],
    form: undefined,
    patient: {
      uuid: 'patient-uuid',
      display: 'Test Patient',
      age: 30,
      birthDate: '1994-01-01',
    },
    location: {
      uuid: 'location-uuid',
      display: 'Test Location',
      name: 'Test Location',
    },
  });

  it('should render "--" when columnStatus is "--"', () => {
    const mockEncounter = createMockEncounter('--');
    const view = renderTag(mockEncounter, 'non-existent-concept', mockStatusColorMappings, mockConfig);
    expect(view).toBe('--');
  });

  it('should render a Tag component with the correct text content', () => {
    const mockEncounter = createMockEncounter({
      uuid: 'status-uuid-1',
      name: {
        name: 'Active',
        display: 'Active',
      },
    });

    render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should not have a title attribute when rendering a Tag', () => {
    const mockEncounter = createMockEncounter({
      uuid: 'status-uuid-1',
      name: {
        name: 'Active',
        display: 'Active',
      },
    });

    const { container } = render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    expect(tag).not.toHaveAttribute('title');
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should apply the correct color type based on status color mappings', () => {
    const mockEncounter = createMockEncounter({
      uuid: 'status-uuid-2',
      name: {
        name: 'Inactive',
        display: 'Inactive',
      },
    });

    const { container } = render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    expect(screen.getByText('Inactive')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    expect(tag).toHaveClass('cds--tag--red');
  });

  it('should render with minimum width style', () => {
    const mockEncounter = createMockEncounter({
      uuid: 'status-uuid-1',
      name: {
        name: 'Active',
        display: 'Active',
      },
    });

    const { container } = render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    expect(tag).toHaveStyle({ minWidth: '80px' });
  });

  it('should handle string values correctly', () => {
    const mockEncounter = createMockEncounter('Completed');

    render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render Tag without color type when uuid is not in statusColorMappings', () => {
    const mockEncounter = createMockEncounter({
      uuid: 'unmapped-uuid',
      name: {
        name: 'Unmapped Status',
        display: 'Unmapped Status',
      },
    });

    const { container } = render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    expect(screen.getByText('Unmapped Status')).toBeInTheDocument();

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    expect(tag).toBeInTheDocument();
    const allColorClasses = Object.values(mockStatusColorMappings).map((color) => `cds--tag--${color}`);
    allColorClasses.forEach((colorClass) => {
      expect(tag).not.toHaveClass(colorClass);
    });
  });

  it('should render Tag without color type when value is a string', () => {
    const mockEncounter = createMockEncounter('String Value');

    const { container } = render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    expect(screen.getByText('String Value')).toBeInTheDocument();

    // String values don't have uuid, so no color type should be applied
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    expect(tag).toBeInTheDocument();
    const allColorClasses = Object.values(mockStatusColorMappings).map((color) => `cds--tag--${color}`);
    allColorClasses.forEach((colorClass) => {
      expect(tag).not.toHaveClass(colorClass);
    });
  });

  it('should render Tag without color type when observation value object lacks uuid property', () => {
    // Create an observation value without uuid property (edge case)
    const mockEncounter: Encounter = {
      uuid: 'encounter-uuid',
      encounterDatetime: '2024-01-01',
      encounterType: {
        uuid: 'encounter-type-uuid',
        name: 'Test Encounter',
      },
      obs: [
        {
          uuid: 'obs-uuid',
          concept: {
            uuid: 'test-concept-uuid',
            name: 'Test Concept',
          },
          value: {
            name: {
              name: 'Status Without UUID',
              display: 'Status Without UUID',
            },
            // Missing uuid property - using type assertion for test case
          } as Observation['value'],
          obsDatetime: '2024-01-01',
        },
      ],
      encounterProviders: [],
      form: undefined,
      patient: {
        uuid: 'patient-uuid',
        display: 'Test Patient',
        age: 30,
        birthDate: '1994-01-01',
      },
      location: {
        uuid: 'location-uuid',
        display: 'Test Location',
        name: 'Test Location',
      },
    };

    const { container } = render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    expect(screen.getByText('Status Without UUID')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    const allColorClasses = Object.values(mockStatusColorMappings).map((color) => `cds--tag--${color}`);
    allColorClasses.forEach((colorClass) => {
      expect(tag).not.toHaveClass(colorClass);
    });
  });

  it('should handle empty statusColorMappings', () => {
    const emptyMappings = {};
    const mockEncounter = createMockEncounter({
      uuid: 'status-uuid-1',
      name: {
        name: 'Active',
        display: 'Active',
      },
    });

    const { container } = render(
      <div data-testid="tag-wrapper">{renderTag(mockEncounter, 'test-concept-uuid', emptyMappings, mockConfig)}</div>,
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    expect(tag).toBeInTheDocument();
    // With empty mappings, verify no color classes from mockStatusColorMappings are applied
    const allColorClasses = Object.values(mockStatusColorMappings).map((color) => `cds--tag--${color}`);
    allColorClasses.forEach((colorClass) => {
      expect(tag).not.toHaveClass(colorClass);
    });
  });

  it('should handle when findObs returns undefined (no observation found)', () => {
    const mockEncounter: Encounter = {
      uuid: 'encounter-uuid',
      encounterDatetime: '2024-01-01',
      encounterType: {
        uuid: 'encounter-type-uuid',
        name: 'Test Encounter',
      },
      obs: [], // No observations
      encounterProviders: [],
      form: undefined,
      patient: {
        uuid: 'patient-uuid',
        display: 'Test Patient',
        age: 30,
        birthDate: '1994-01-01',
      },
      location: {
        uuid: 'location-uuid',
        display: 'Test Location',
        name: 'Test Location',
      },
    };

    const view = renderTag(mockEncounter, 'non-existent-concept', mockStatusColorMappings, mockConfig);
    // When no observation is found, getObsFromEncounter returns '--'
    expect(view).toBe('--');
  });
});
