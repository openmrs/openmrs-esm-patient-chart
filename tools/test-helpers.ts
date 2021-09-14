import { screen, waitForElementToBeRemoved } from '@testing-library/react';

// Custom matcher that queries elements split up by multiple HTML elements by text
export function getByTextWithMarkup(text: RegExp | string) {
  return screen.getByText((content, node) => {
    const hasText = (node: Element) => node.textContent === text || node.textContent.match(text);
    const childrenDontHaveText = Array.from(node.children).every((child) => !hasText(child as HTMLElement));
    return hasText(node) && childrenDontHaveText;
  });
}

export function waitForLoadingToFinish() {
  return waitForElementToBeRemoved(() => [...screen.queryAllByRole(/progressbar/i)], {
    timeout: 4000,
  });
}
