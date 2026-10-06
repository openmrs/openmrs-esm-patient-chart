import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { WorkspaceBackButton } from './workspace-back-button.component';

describe('WorkspaceBackButton', () => {
  it('renders a button with the provided label and triggers onClick', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<WorkspaceBackButton label="Back to order basket" onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /back to order basket/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Back to order basket')).toBeInTheDocument();

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
