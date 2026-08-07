import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { openmrsFetch, type FetchResponse } from '@openmrs/esm-framework';
import PrintVisitSummaryModal from './print-visit-summary.modal';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockCreateObjectURL = vi.mocked(window.URL.createObjectURL);
const mockCloseModal = vi.fn();

const visitUuid = 'test-visit-uuid';
const mockPdfBlob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
const mockObjectUrl = 'blob:mock-visit-summary-pdf';

const notAuthorizedText = /you do not have permission to generate visit summaries/i;
const visitNotFoundText = /this visit could not be found on the server/i;
const generationFailedText = /the server could not generate the visit summary/i;
const networkErrorText = /check your network connection and try again/i;

const renderModal = () => render(<PrintVisitSummaryModal visitUuid={visitUuid} closeModal={mockCloseModal} />);

const rejectionWithStatus = (status: number) =>
  Object.assign(new Error(`Server responded with ${status}`), { response: { status } });

describe('PrintVisitSummaryModal', () => {
  beforeEach(() => {
    mockCreateObjectURL.mockReturnValue(mockObjectUrl);
    window.URL.revokeObjectURL = vi.fn();
  });

  it('shows a loading state while the PDF is being generated', () => {
    mockOpenmrsFetch.mockImplementation(() => new Promise(() => {}));

    renderModal();

    expect(screen.getByText(/generating visit summary/i)).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('renders the PDF preview and an enabled download link on success', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      blob: () => Promise.resolve(mockPdfBlob),
    } as unknown as FetchResponse);

    renderModal();

    const previewFrame = await screen.findByTitle(/visit summary preview/i);
    expect(previewFrame).toHaveAttribute('src', mockObjectUrl);
    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      expect.stringContaining(`patientdocuments/visitSummary?visitUuid=${visitUuid}`),
      expect.anything(),
    );
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockPdfBlob);

    const downloadLink = screen.getByRole('link', { name: /download/i });
    expect(downloadLink).toHaveAttribute('href', mockObjectUrl);
    expect(downloadLink).toHaveAttribute('download', 'visit-summary.pdf');
  });

  it('revokes the object URL on unmount', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      blob: () => Promise.resolve(mockPdfBlob),
    } as unknown as FetchResponse);

    const { unmount } = renderModal();
    await screen.findByTitle(/visit summary preview/i);

    unmount();

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectUrl);
  });

  it('does not retain the revoked object URL when the visit changes', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce({
        blob: () => Promise.resolve(mockPdfBlob),
      } as unknown as FetchResponse)
      .mockImplementationOnce(() => new Promise(() => {}));

    const { rerender } = renderModal();
    await screen.findByTitle(/visit summary preview/i);

    rerender(<PrintVisitSummaryModal visitUuid="another-visit-uuid" closeModal={mockCloseModal} />);

    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectUrl);
    expect(screen.queryByTitle(/visit summary preview/i)).not.toBeInTheDocument();
    expect(screen.getByText(/generating visit summary/i)).toBeInTheDocument();
  });

  it('shows the not-authorized error for a 403 response', async () => {
    mockOpenmrsFetch.mockRejectedValue(rejectionWithStatus(403));

    renderModal();

    expect(await screen.findByText(notAuthorizedText)).toBeInTheDocument();
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/visit summary preview/i)).not.toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('shows the visit-not-found error for a 404 response, distinct from the 403 message', async () => {
    mockOpenmrsFetch.mockRejectedValue(rejectionWithStatus(404));

    renderModal();

    expect(await screen.findByText(visitNotFoundText)).toBeInTheDocument();
    expect(screen.getByText(/visit not found/i)).toBeInTheDocument();
    expect(screen.queryByText(notAuthorizedText)).not.toBeInTheDocument();
  });

  it('shows the generation-failed error for a 500 response, distinct from the other messages', async () => {
    mockOpenmrsFetch.mockRejectedValue(rejectionWithStatus(500));

    renderModal();

    expect(await screen.findByText(generationFailedText)).toBeInTheDocument();
    expect(screen.getByText(/pdf generation failed/i)).toBeInTheDocument();
    expect(screen.queryByText(notAuthorizedText)).not.toBeInTheDocument();
    expect(screen.queryByText(visitNotFoundText)).not.toBeInTheDocument();
  });

  it('shows the generation-failed error, not the network error, when the response body cannot be read', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      blob: () => Promise.reject(new TypeError('Failed to read response body')),
    } as unknown as FetchResponse);

    renderModal();

    expect(await screen.findByText(generationFailedText)).toBeInTheDocument();
    expect(screen.getByText(/pdf generation failed/i)).toBeInTheDocument();
    expect(screen.queryByText(networkErrorText)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/visit summary preview/i)).not.toBeInTheDocument();
  });

  it('shows the network error when the request rejects without a response', async () => {
    mockOpenmrsFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    renderModal();

    expect(await screen.findByText(networkErrorText)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.queryByText(notAuthorizedText)).not.toBeInTheDocument();
    expect(screen.queryByText(generationFailedText)).not.toBeInTheDocument();
  });

  it('closes the modal when the close button is clicked', async () => {
    const user = userEvent.setup();
    mockOpenmrsFetch.mockResolvedValue({
      blob: () => Promise.resolve(mockPdfBlob),
    } as unknown as FetchResponse);

    renderModal();
    await screen.findByTitle(/visit summary preview/i);

    const footerCloseButton = screen
      .getAllByRole('button', { name: /close/i })
      .find((button) => button.textContent === 'Close');
    await user.click(footerCloseButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });
});
