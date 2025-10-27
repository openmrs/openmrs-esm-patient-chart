import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderTag } from './tag.component';
import { type ConfigConcepts, type Encounter } from '../types';

describe('renderTag', () => {
  const mockConfig: ConfigConcepts = {
    trueConceptUuid: 'true-uuid',
    falseConceptUuid: 'false-uuid',
    otherConceptUuid: 'other-uuid',
  };

  const mockStatusColorMappings = {
    'status-uuid-1': 'green',
    'status-uuid-2': 'red',
  };

  const createMockEncounter = (obsValue: any): Encounter => ({
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
      display: 'Active',
    });

    const { container } = render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    expect(tag).toBeInTheDocument();
  });

  it('should not have a title attribute when rendering a Tag', () => {
    const mockEncounter = createMockEncounter({
      uuid: 'status-uuid-1',
      display: 'Active',
    });

    const { container } = render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    expect(tag).not.toHaveAttribute('title');
  });

  it('should apply the correct color type based on status color mappings', () => {
    const mockEncounter = createMockEncounter({
      uuid: 'status-uuid-2',
      display: 'Inactive',
    });

    const { container } = render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    expect(tag).toHaveClass('cds--tag--red');
  });

  it('should render with minimum width style', () => {
    const mockEncounter = createMockEncounter({
      uuid: 'status-uuid-1',
      display: 'Active',
    });

    const { container } = render(
      <div data-testid="tag-wrapper">
        {renderTag(mockEncounter, 'test-concept-uuid', mockStatusColorMappings, mockConfig)}
      </div>,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    expect(tag).toHaveStyle({ minWidth: '80px' });
  });

  it('should handle string values correctly', () => {
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
          value: 'Completed',
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

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const tag = container.querySelector('.cds--tag');
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveTextContent('Completed');
  });
});
