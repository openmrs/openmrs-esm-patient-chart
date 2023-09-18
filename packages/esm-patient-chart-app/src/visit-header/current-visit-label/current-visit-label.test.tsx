import React from 'react';
import { render, screen } from '@testing-library/react';
import CurrentVisitLabel from './current-visit-label.component';

describe('CurrentVisitLabel component', () => {
  const queueEntryData = {
    id: '1',
    name: 'John Doe',
    patientUuid: 'patient123',
    priority: 'Not Urgent',
    priorityUuid: 'priority123',
    service: 'General Checkup',
    status: 'Waiting',
    statusUuid: 'status123',
    visitUuid: 'visit123',
    visitType: 'Checkup',
    queueUuid: 'queue123',
    queueEntryUuid: 'queueEntry123',
  };

  const currentVisitData = {
    visitType: {
      display: 'Checkup',
    },
  };

  test('should render component with correct visit type and tag', () => {
    render(<CurrentVisitLabel queueEntry={queueEntryData as any} currentVisit={currentVisitData as any} />);

    // Check if the visit type and tag are rendered with correct values
    expect(screen.getByText('Checkup')).toBeInTheDocument();
    expect(screen.getByText('Not Urgent')).toBeInTheDocument();
    expect(screen.getByText('Not Urgent')).toHaveAttribute('title', 'Not Urgent');
  });

  test('should render component with priority tag and Edit button', () => {
    // Update the queue entry data to have a priority
    const queueEntryDataWithPriority = {
      priority: 'Priority',
    };

    render(<CurrentVisitLabel queueEntry={queueEntryDataWithPriority as any} currentVisit={currentVisitData as any} />);

    // Check if the priority tag and Edit button are rendered
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toHaveAttribute('title', 'Priority');
    const editButton = screen.getByRole('button', { name: 'Edit visit' });
    expect(editButton).toBeInTheDocument();
  });

  test('should return null if queueEntry or currentVisit is missing', () => {
    // Render the component with missing queueEntry
    render(<CurrentVisitLabel currentVisit={currentVisitData as any} queueEntry={{} as any} />);
    expect(screen.queryByText('Checkup')).not.toBeNull(); // Check if the component is null
    expect(screen.queryByText('Not Urgent')).toBeNull();
  });

  test('should return null if queueEntry or currentVisit is null', () => {
    // Render the component with missing currentVisit
    render(<CurrentVisitLabel queueEntry={queueEntryData as any} currentVisit={{} as any} />);
    expect(screen.queryByText('Not Urgent')).not.toBeNull(); // Check if the component is null
    expect(screen.queryByText('Checkup')).toBeNull();
  });
});
