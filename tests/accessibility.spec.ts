import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('accessibility', () => {
  test('home page has no automatically detectable WCAG A/AA violations', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations).toEqual([])
  })

  test('project selector is usable from the keyboard', async ({ page }) => {
    await page.goto('/')
    const firstTab = page.getByRole('tab', { name: 'I need a website' })
    await firstTab.focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'My current site needs work' })).toBeFocused()
    await expect(page.getByRole('tabpanel')).toContainText('Make the site you have pull its weight.')
  })

  test('mobile navigation moves focus into the menu and restores it on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const menuButton = page.getByRole('button', { name: 'Open navigation' })
    await menuButton.click()
    await expect(page.getByRole('link', { name: 'Why Me' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menuButton).toBeFocused()
  })
})
