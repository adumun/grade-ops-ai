import { test, expect } from "@playwright/test";

test.describe("local-preview root and /preview", () => {
  test("root enters preview and renders the deterministic mock queue", async ({ page }) => {
    const rootResponse = await page.goto("/");

    expect(rootResponse?.status()).toBe(200);
    expect(page.url()).toMatch(/\/preview$/);
    await expect(page.getByText("Todas mis clases", { exact: true })).toBeVisible();
  });

  test("responds successfully with the deterministic mock queue", async ({ page }) => {
    const response = await page.goto("/preview");

    expect(response?.status()).toBe(200);
    await expect(page.getByText("Todas mis clases", { exact: true })).toBeVisible();
    await expect(page.locator('section[aria-labelledby="attention-title"] article')).toHaveCount(5);
    await expect(page.locator("header")).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("keeps the shell proportions and scroll behavior at the configured viewport", async ({ page }) => {
    await page.goto("/preview");

    const layout = await page.locator("main").evaluate((main) => {
      const primary = main.querySelector('[aria-labelledby="attention-title"]')?.getBoundingClientRect();
      const secondary = main.querySelector('[aria-labelledby="upcoming-title"]')?.getBoundingClientRect();
      const grid = getComputedStyle(main).gridTemplateColumns;
      return {
        grid,
        ratio: primary && secondary ? primary.width / secondary.width : 0,
      };
    });

    const viewportWidth = await page.evaluate(() => window.innerWidth);
    if (viewportWidth >= 1200) {
      expect(layout.grid.split(" ")).toHaveLength(2);
      expect(layout.ratio).toBeGreaterThan(2.5);
      expect(layout.ratio).toBeLessThan(3.5);
    } else if (viewportWidth >= 981) {
      expect(layout.grid.split(" ")).toHaveLength(2);
      expect(layout.ratio).toBeGreaterThan(1.5);
      expect(layout.ratio).toBeLessThan(2.5);
    } else {
      expect(layout.grid.split(" ")).toHaveLength(1);
    }

    await page.locator("main").evaluate((main) => {
      main.scrollTop = main.scrollHeight;
    });
    await expect(page.locator("header")).toBeVisible();
    if (viewportWidth > 640) {
      await expect(page.locator("aside")).toBeVisible();
    } else {
      await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeVisible();
    }
  });

  test("supports the configured navigation mode and mobile drawer behavior", async ({ page }) => {
    test.setTimeout(15_000);
    await page.goto("/preview");

    const viewportWidth = await page.evaluate(() => window.innerWidth);
    if (viewportWidth > 640) {
      await expect(page.locator("aside")).toBeVisible();
      await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeHidden();
      return;
    }

    const menuButton = page.getByRole("button", { name: "Abrir navegación" });
    const sidebar = page.locator("#teacher-home-nav");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar).toBeVisible();

    await sidebar.getByRole("button", { name: "Cerrar navegación" }).click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.click();
    await page.mouse.click(viewportWidth - 10, 100);
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.click();
    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("keeps loading actions inert and exposes the empty state", async ({ page }) => {
    await page.goto("/preview");
    const state = page.getByLabel("Estado de demo");

    await state.selectOption("loading");
    await expect(page.getByLabel("Cargando Inicio").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /ver todas en operaciones/i })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Limpiar" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Ver calendario" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Ver en Operaciones" })).toBeDisabled();

    await state.selectOption("empty");
    await expect(page.getByText("No tienes tareas pendientes")).toBeVisible();
    await expect(page.locator('section[aria-labelledby="attention-title"]')).toContainText("No tienes tareas pendientes");
  });

  test("has no horizontal overflow at the configured viewport", async ({ page }) => {
    await page.goto("/preview");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });
});
