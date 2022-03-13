import React from 'react';
import OrderBasketActionButton from './order--basket-action-button.component';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, useStore } from '@openmrs/esm-framework';

const mockedUseStore = useStore as jest.Mock;
const mockedLayoutType = useLayoutType as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useStore: jest.fn(),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useWorkspaces: jest.fn(() => {
      return { workspaces: [{ name: 'order-basket' }] };
    }),
  };
});

describe('<OrderBasketActionButton/>', () => {
  it('should display tablet view action button', () => {
    mockedLayoutType.mockReturnValueOnce('tablet');
    mockedUseStore.mockReturnValueOnce({ items: [] });
    render(<OrderBasketActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Order Basket/i });
    expect(visitNoteButton).toBeInTheDocument();
    expect(visitNoteButton).toHaveClass('container');
    userEvent.click(visitNoteButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('order-basket-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });

  it('should display desktop view action button', () => {
    mockedLayoutType.mockReturnValueOnce('desktop');
    mockedUseStore.mockReturnValueOnce({ items: [] });
    render(<OrderBasketActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Orders/i });
    expect(visitNoteButton).toBeInTheDocument();
    userEvent.click(visitNoteButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('order-basket-workspace');
    expect(visitNoteButton).toHaveClass('active');
  });

  it('should display the count Tag if order are present on desktop view', () => {
    mockedLayoutType.mockReturnValueOnce('desktop');
    mockedUseStore.mockReturnValueOnce({ items: [{ name: 'order-01', uuid: 'some-uuid' }] });
    render(<OrderBasketActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Order/i });
    expect(visitNoteButton).toHaveTextContent(1);
  });

  it('should display the count Tag if order are present on tablet view', () => {
    mockedLayoutType.mockReturnValueOnce('tablet');
    mockedUseStore.mockReturnValueOnce({ items: [{ name: 'order-01', uuid: 'some-uuid' }] });
    render(<OrderBasketActionButton />);

    const visitNoteButton = screen.getByRole('button', { name: /Order/i });
    expect(visitNoteButton).toHaveTextContent(1);
  });
});
