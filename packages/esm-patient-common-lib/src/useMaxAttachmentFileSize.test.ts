import React from 'react';
import { expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { useMaxAttachmentFileSize } from './useMaxAttachmentFileSize';

const wrapper = ({ children }) =>
  React.createElement(SWRConfig, { value: { provider: () => new Map(), shouldRetryOnError: false } }, children);

test.each(['0', '0.5', '5'])('reads the backend limit of %s MB', async (value) => {
  vi.mocked(openmrsFetch).mockResolvedValueOnce(
    Object.assign(new Response(), {
      data: {
        results: [
          { property: 'attachments.maxUploadFileSize.other', value: '99' },
          { property: 'attachments.maxUploadFileSize', value },
        ],
      },
    }),
  );
  const { result } = renderHook(useMaxAttachmentFileSize, { wrapper });
  await waitFor(() => expect(result.current.maxFileSize).toBe(Number(value)));
});

test.each(['', 'invalid', '-1'])('does not invent a limit for an invalid setting: %s', async (value) => {
  vi.mocked(openmrsFetch).mockResolvedValueOnce(
    Object.assign(new Response(), {
      data: { results: [{ property: 'attachments.maxUploadFileSize', value }] },
    }),
  );
  const { result } = renderHook(useMaxAttachmentFileSize, { wrapper });
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.maxFileSize).toBeUndefined();
});

test('retry reports another failure through hook state and then recovers', async () => {
  const error = new Error('Network error');
  vi.mocked(openmrsFetch)
    .mockRejectedValueOnce(error)
    .mockRejectedValueOnce(error)
    .mockResolvedValueOnce(
      Object.assign(new Response(), {
        data: { results: [{ property: 'attachments.maxUploadFileSize', value: '5' }] },
      }),
    );
  const { result } = renderHook(useMaxAttachmentFileSize, { wrapper });
  await waitFor(() => expect(result.current.error).toBe(error));
  await act(async () => {
    await result.current.retry();
  });
  expect(result.current.error).toBe(error);
  expect(result.current.maxFileSize).toBeUndefined();
  await act(async () => {
    await result.current.retry();
  });
  expect(result.current.error).toBeUndefined();
  expect(result.current.maxFileSize).toBe(5);
});
