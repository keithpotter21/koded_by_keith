import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('accessibility', () => {
  test('home page has no automatically detectable WCAG A/AA violations', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations).toEqual([])
  })

  test('contact form exposes its required fields to assistive technology', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByLabel(/^Name/)).toHaveAttribute('required', '')
    await expect(page.getByLabel(/^Business name/)).toHaveAttribute('required', '')
    await expect(page.getByLabel(/^Email/)).toHaveAttribute('required', '')
    await expect(page.getByLabel(/^Tell me about your business/)).toHaveAttribute('required', '')
  })

  test('mobile navigation moves focus into the menu and restores it on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const menuButton = page.getByRole('button', { name: 'Open navigation' })
    await menuButton.click()
    await expect(page.locator('#mobile-nav').getByRole('link', { name: 'Home' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menuButton).toBeFocused()
  })
})
