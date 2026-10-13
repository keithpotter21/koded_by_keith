import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

function luminance(rgb: string) {
  const values =
    rgb
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number) || [];
  const [red, green, blue] = values.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

test.describe("accessibility", () => {
  test("home page has no automatically detectable WCAG A/AA violations", async ({
    page,
  }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("contact form exposes its required fields to assistive technology", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByLabel(/^Name/)).toHaveAttribute("required", "");
    await expect(page.getByLabel(/^Business name/)).toHaveAttribute(
      "required",
      "",
    );
    await expect(page.getByLabel(/^Email/)).toHaveAttribute("required", "");
    await expect(page.getByLabel(/^Current website/)).not.toHaveAttribute(
      "required",
      "",
    );
    await expect(
      page.getByLabel(/^Tell me about your business/),
    ).toHaveAttribute("required", "");
    await page.getByLabel(/^Current website/).fill("http://example.com");
    await expect(page.getByLabel(/^Current website/)).toHaveJSProperty(
      "validity.valid",
      true,
    );
  });

  test("package buttons map to New Website and preserve the selected package", async ({
    page,
  }) => {
    await page.goto("/");
    const packages = ["The Basics", "The Works", "The Whole Enchilada"];
    for (const packageName of packages) {
      await page
        .locator(".price-card", { hasText: packageName })
        .getByRole("link", { name: /Get Started/ })
        .click();
      await expect(page.getByLabel(/I’m interested in/)).toHaveValue(
        "New Website",
      );
      await expect(
        page.locator(".contact-form-wrap p", {
          hasText: `Selected package: ${packageName}`,
        }),
      ).toBeVisible();
    }
  });

  test("secondary-page navigation points back to homepage sections", async ({
    page,
  }) => {
    await page.goto("/privacy");
    await expect(
      page
        .getByRole("navigation")
        .getByRole("link", { name: "Home", exact: true }),
    ).toHaveAttribute("href", "/");
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Packages" }),
    ).toHaveAttribute("href", "/#packages");
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Accessibility" }),
    ).toHaveAttribute("href", "/#accessibility");
    await expect(
      page.getByRole("navigation").getByRole("link", { name: /Let’s Talk/ }),
    ).toHaveAttribute("href", "/#contact");
  });

  test("package detail and CTA text meet AA contrast in both themes", async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto("/");
    for (const theme of ["dark", "light"]) {
      if (theme === "light")
        await page
          .getByRole("button", { name: "Switch to light mode" })
          .click();
      for (const selector of [".price-card li", ".price-card .card-action"]) {
        const colors = await page
          .locator(selector)
          .first()
          .evaluate((element) => {
            const foreground = getComputedStyle(element).color;
            let current: Element | null = element;
            let background = "rgb(255, 255, 255)";
            while (current) {
              const candidate = getComputedStyle(current).backgroundColor;
              if (candidate && candidate !== "rgba(0, 0, 0, 0)") {
                background = candidate;
                break;
              }
              current = current.parentElement;
            }
            return { foreground, background };
          });
        expect(
          contrastRatio(colors.foreground, colors.background),
          `${theme} ${selector}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test("homepage and privacy page reflow without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const path of ["/", "/privacy"]) {
      await page.goto(path);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(
        dimensions.clientWidth,
      );
    }
  });

  test("mobile navigation moves focus into the menu and restores it on Escape", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Open navigation" });
    await menuButton.click();
    await expect(
      page.locator("#mobile-nav").getByRole("link", { name: "Home" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menuButton).toBeFocused();
  });
});
