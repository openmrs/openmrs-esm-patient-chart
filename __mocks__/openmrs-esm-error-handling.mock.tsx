import { never } from "rxjs";

export function createErrorHandler() {
  return jest.fn().mockReturnValue(never());
}

export function reportError() {
  return jest.fn();
}
