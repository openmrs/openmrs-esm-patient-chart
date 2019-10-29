import { never } from "rxjs";

export function createErrorHandler() {
  return jest.fn().mockReturnValue(never());
}
