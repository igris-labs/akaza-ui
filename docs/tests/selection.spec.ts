import { expect, test } from '@playwright/test'

test('custom pickup controls toggle and replace selection with an enabled range', async ({ page }) => {
  await page.goto('/composables/use-selection')
  await expect(page.getByRole('button', { name: 'Search documentation', exact: true }).filter({ visible: true })).toBeEnabled()
  const days = page.getByRole('group', { name: 'Pickup days' })
  const monday = days.getByRole('checkbox', { name: 'Monday' })
  const tuesday = days.getByRole('checkbox', { name: 'Tuesday' })
  const wednesday = days.getByRole('checkbox', { name: 'Wednesday' })
  const thursday = days.getByRole('checkbox', { name: 'Thursday' })
  await expect(tuesday).toBeDisabled()
  await monday.press('Space')
  await expect(monday).toBeChecked()
  await wednesday.click()
  await expect(wednesday).toBeChecked()
  await expect(page.getByText('2 selected', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Select Monday to Thursday' }).press('Enter')
  await expect(monday).toBeChecked()
  await expect(tuesday).not.toBeChecked()
  await expect(wednesday).toBeChecked()
  await expect(thursday).toBeChecked()
  await expect(page.getByText('3 selected', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Clear', exact: true }).click()
  await expect(days.locator(':checked')).toHaveCount(0)
  await expect(page.getByText('0 selected', { exact: true })).toBeVisible()
})
