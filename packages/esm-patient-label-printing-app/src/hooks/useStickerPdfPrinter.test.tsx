import { act, renderHook, waitFor } from '@testing-library/react';
import { useStickerPdfPrinter } from './useStickerPdfPrinter';

describe('useStickerPdfPrinter', () => {
  let mockContentWindow: any;
  let afterPrintHandler: (() => void) | null = null;

  beforeEach(() => {
    afterPrintHandler = null;

    // Create a mock contentWindow with all required methods
    mockContentWindow = {
      print: jest.fn(),
      focus: jest.fn(),
      addEventListener: jest.fn((event: string, handler: () => void) => {
        if (event === 'afterprint') {
          afterPrintHandler = handler;
        }
      }),
    };

    // Mock HTMLIFrameElement.prototype.contentWindow to return our mock
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
      configurable: true,
      get: () => mockContentWindow,
    });

    Object.defineProperty(HTMLIFrameElement.prototype, 'src', {
      configurable: true,
      set: function (value) {
        this._src = value;
        // Trigger onload asynchronously to simulate real behavior
        if (this.onload) {
          Promise.resolve().then(() => {
            if (this.onload) {
              this.onload({} as Event);
            }
          });
        }
      },
      get: function () {
        return this._src;
      },
    });

    // Mock document.hasFocus to support the polling mechanism
    document.hasFocus = jest.fn().mockReturnValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    afterPrintHandler = null;
  });

  const waitForIframeLoad = () => {
    // Wait for next tick to allow iframe onload to trigger
    return new Promise((resolve) => setTimeout(resolve, 0));
  };

  const triggerPrintCompletion = () => {
    // Simulate the print dialog closing by triggering afterprint event
    if (afterPrintHandler) {
      afterPrintHandler();
    }
  };

  it('should provide printPdf function and isPrinting state', () => {
    const { result } = renderHook(() => useStickerPdfPrinter());

    expect(result.current.isPrinting).toBe(false);
    expect(typeof result.current.printPdf).toBe('function');
  });

  it('should set isPrinting to true when printing starts', () => {
    const { result } = renderHook(() => useStickerPdfPrinter());

    act(() => {
      result.current.printPdf('http://example.com/test.pdf');
    });

    expect(result.current.isPrinting).toBe(true);
  });

  it('should reject concurrent print requests with an error', async () => {
    const { result } = renderHook(() => useStickerPdfPrinter());

    act(() => {
      result.current.printPdf('http://example.com/test.pdf');
    });

    await expect(result.current.printPdf('http://example.com/test2.pdf')).rejects.toThrow('Print already in progress');
  });

  it('should reset isPrinting to false when printing completes', async () => {
    const { result } = renderHook(() => useStickerPdfPrinter());

    act(() => {
      result.current.printPdf('http://example.com/test.pdf');
    });

    expect(result.current.isPrinting).toBe(true);

    // Wait for iframe to load
    await act(async () => {
      await waitForIframeLoad();
    });

    // Simulate print completion
    act(() => {
      triggerPrintCompletion();
    });

    await waitFor(() => {
      expect(result.current.isPrinting).toBe(false);
    });
  });

  it('should return a promise that resolves when printing completes', async () => {
    const { result } = renderHook(() => useStickerPdfPrinter());

    let resolved = false;
    let printPromise: Promise<void>;

    act(() => {
      printPromise = result.current.printPdf('http://example.com/test.pdf').then(() => {
        resolved = true;
      });
    });

    expect(resolved).toBe(false);

    // Wait for iframe to load
    await act(async () => {
      await waitForIframeLoad();
    });

    // Simulate print completion
    act(() => {
      triggerPrintCompletion();
    });

    await waitFor(() => {
      expect(resolved).toBe(true);
    });

    await printPromise!;
  });

  it('should allow printing again after previous print completes', async () => {
    const { result } = renderHook(() => useStickerPdfPrinter());

    // First print
    act(() => {
      result.current.printPdf('http://example.com/test1.pdf');
    });

    await act(async () => {
      await waitForIframeLoad();
    });

    act(() => {
      triggerPrintCompletion();
    });

    await waitFor(() => {
      expect(result.current.isPrinting).toBe(false);
    });

    // Second print should succeed
    act(() => {
      result.current.printPdf('http://example.com/test2.pdf');
    });

    expect(result.current.isPrinting).toBe(true);

    await act(async () => {
      await waitForIframeLoad();
    });

    act(() => {
      triggerPrintCompletion();
    });

    await waitFor(() => {
      expect(result.current.isPrinting).toBe(false);
    });
  });

  it('should reset isPrinting after timeout when print cannot be detected as complete', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useStickerPdfPrinter());

    act(() => {
      result.current.printPdf('http://example.com/test.pdf');
    });

    expect(result.current.isPrinting).toBe(true);

    // Fast-forward time to trigger iframe load, then advance past timeout
    // The iframe onload will be triggered via Promise.resolve() which needs runAllTimers
    await act(async () => {
      await jest.runAllTimersAsync();
    });

    // Verify timeout mechanism resets isPrinting (afterprint never fired)
    expect(result.current.isPrinting).toBe(false);
  });

  it('should handle errors gracefully and reset isPrinting state', async () => {
    // Mock contentWindow to return null to simulate an error
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
      configurable: true,
      get: () => null,
    });

    const { result } = renderHook(() => useStickerPdfPrinter());

    let resolved = false;
    act(() => {
      result.current.printPdf('http://example.com/test.pdf').then(() => {
        resolved = true;
      });
    });

    // Wait for iframe to attempt loading and trigger error path
    await act(async () => {
      await waitForIframeLoad();
    });

    await waitFor(() => {
      expect(result.current.isPrinting).toBe(false);
    });

    expect(resolved).toBe(true);
  });
});
