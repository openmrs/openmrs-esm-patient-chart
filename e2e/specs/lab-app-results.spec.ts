import { expect, type Locator } from '@playwright/test';
import { test } from '../core/lab-fixtures';
import { expectLabResultInResultsViewer } from '../commands/test-helpers';
import { LaboratoryPage } from '../pages';

// Laboratory worklist tabs this spec navigates. Typed as a union rather than `string` so a mistyped
// tab name is a compile error instead of a locator that silently never resolves.
type LaboratoryTab = 'Tests ordered' | 'In progress' | 'Completed';

test.describe('Adding laboratory results via the Laboratory app', () => {
  test('Pick up a lab request and enter results from the Laboratory worklist', async ({
    page,
    patient,
    existingLabOrder,
  }) => {
    const laboratoryPage = new LaboratoryPage(page);
    const conceptName = existingLabOrder.testOrder.concept.display;
    // The worklist groups requests by patient. Search on the full generated name (given + family) so
    // the term is unique across the system-wide worklist; a given name alone (1-in-10k) can collide
    // with, or be a substring of, another patient's row and trip Playwright's strict mode.
    const patientSearchTerm = patient.person.display;

    // The Laboratory app renders every status tab's table into the DOM simultaneously, so all
    // interactions are scoped to the active tab's panel to avoid cross-tab matches. This selects the
    // given tab, filters its table to the seeded patient, and returns the scoped panel locator. The
    // tab is located by the same `LaboratoryTab` literal as its panel, so both go through the union.
    const searchPatientInTab = async (tabName: LaboratoryTab): Promise<Locator> => {
      await page.getByRole('tab', { name: tabName }).click();
      const panel = page.getByRole('tabpanel', { name: tabName });
      await panel.getByPlaceholder(/search this list/i).fill(patientSearchTerm);
      await expect(panel.getByRole('row').filter({ hasText: patientSearchTerm })).toBeVisible();
      return panel;
    };

    // As above, then expands the patient's row to reveal the per-order actions.
    const searchAndExpandInTab = async (tabName: LaboratoryTab): Promise<Locator> => {
      const panel = await searchPatientInTab(tabName);
      await panel
        .getByRole('row')
        .filter({ hasText: patientSearchTerm })
        .getByRole('button', { name: /expand current row/i })
        .click();
      return panel;
    };

    let testsOrderedPanel: Locator;
    let inProgressPanel: Locator;

    await test.step('When I navigate to the Laboratory app', async () => {
      await laboratoryPage.goTo();
      await expect(page.getByRole('tab', { name: /tests ordered/i })).toBeVisible();
    });

    await test.step('And I search for my patient under the `Tests ordered` tab and expand their request', async () => {
      testsOrderedPanel = await searchAndExpandInTab('Tests ordered');
    });

    await test.step('Then I should see the ordered test in the expanded details', async () => {
      await expect(testsOrderedPanel.getByText(conceptName, { exact: false })).toBeVisible();
    });

    await test.step('When I click the `Pick lab request` action', async () => {
      await testsOrderedPanel.getByRole('button', { name: /^pick lab request$/i }).click();
    });

    await test.step('And I confirm the pick up in the modal', async () => {
      await page
        .getByRole('dialog')
        .getByRole('button', { name: /pick up lab request/i })
        .click();
    });

    await test.step('Then the request should be picked up successfully', async () => {
      await expect(page.getByText(/successfully picked an order/i)).toBeVisible();
    });

    await test.step('When I switch to the `In progress` tab and expand my patient’s request', async () => {
      inProgressPanel = await searchAndExpandInTab('In progress');
    });

    await test.step('And I click the `Add lab results` action', async () => {
      await inProgressPanel.getByRole('button', { name: /add lab results/i }).click();
    });

    await test.step('Then the lab results form should open', async () => {
      await expect(page.getByRole('spinbutton', { name: conceptName })).toBeVisible();
    });

    await test.step('When I fill in the result and save', async () => {
      await page.getByRole('spinbutton', { name: conceptName }).fill('55');
      await page.getByRole('button', { name: 'Save and close' }).click();
    });

    await test.step('Then a confirmation message should indicate the result was saved', async () => {
      await expect(page.getByText(/Lab results for .* have been successfully updated/i)).toBeVisible();
    });

    await test.step('And the resulted request should move to the `Completed` tab', async () => {
      await searchPatientInTab('Completed');
    });

    await test.step('Then I should see the saved lab result in the Results Viewer', async () => {
      await expectLabResultInResultsViewer(page, patient.uuid, conceptName, '55');
    });
  });
});
