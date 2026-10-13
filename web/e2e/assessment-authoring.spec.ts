import { expect, test } from "@playwright/test";

test.describe("WEBUI-004 first assessment authoring unit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/preview/assessments");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test("shows the action empty state and navigates to purpose", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /aún no tienes evaluaciones configuradas/i })).toBeVisible();
    await page.getByRole("link", { name: /crear mi primera evaluación/i }).click();
    await expect(page).toHaveURL(/\/preview\/assessments\/new\/purpose$/);
    await expect(page.getByRole("heading", { name: /propósito de la evaluación/i })).toBeVisible();
    await page.getByRole("link", { name: "Volver a Evaluaciones" }).click();
    await expect(page).toHaveURL(/\/preview\/assessments$/);
    await page.getByRole("button", { name: "Nueva evaluación" }).click();
    await expect(page).toHaveURL(/\/preview\/assessments\/new\/purpose$/);
  });

  test("connects Inicio, shared navigation and the next-step action", async ({ page }) => {
    await page.goto("/preview");
    const pageHeader = page.locator('[data-layout="page-header"]');
    const shortcuts = page.locator('[aria-labelledby="shortcuts-title"]');
    await expect(pageHeader.getByRole("link", { name: "Nueva evaluación" })).toHaveAttribute("href", "/preview/assessments/new/purpose");
    await expect(shortcuts.getByRole("link", { name: "Nueva evaluación" })).toHaveAttribute("href", "/preview/assessments/new/purpose");
    await shortcuts.getByRole("link", { name: "Nueva evaluación" }).click();
    await expect(page).toHaveURL(/\/preview\/assessments\/new\/purpose$/);
    await page.getByRole("link", { name: "Volver a Evaluaciones" }).click();
    await expect(page).toHaveURL(/\/preview\/assessments$/);

    await page.goto("/preview");
    if (await page.evaluate(() => window.innerWidth <= 640)) {
      await page.getByRole("button", { name: "Abrir navegación" }).click();
      await page.locator("#teacher-home-nav-mobile").getByRole("link", { name: "Evaluaciones" }).click();
    } else {
      await page.locator("#teacher-home-nav").getByRole("link", { name: "Evaluaciones" }).click();
    }
    await expect(page).toHaveURL(/\/preview\/assessments$/);
    await expect(page.getByRole("button", { name: "Nueva evaluación" })).toBeVisible();
  });

  test("creates, returns and recovers the local draft", async ({ page }) => {
    await page.getByRole("link", { name: /crear mi primera evaluación/i }).click();
    await page.getByRole("textbox", { name: /^Título/ }).fill("Diagnóstico de funciones");
    await page.getByRole("textbox", { name: "Temática" }).fill("Funciones y modularidad");
    await page.getByRole("textbox", { name: "Propósito pedagógico" }).fill("Demostrar composición");
    await page.getByRole("button", { name: /guardar borrador/i }).click();
    await expect(page.getByRole("status")).toContainText("Borrador guardado localmente");
    await page.getByRole("link", { name: /volver a evaluaciones/i }).click();
    await expect(page.getByRole("heading", { name: /continúa donde lo dejaste/i })).toBeVisible();
    await page.getByRole("link", { name: /retomar borrador/i }).click();
    await expect(page.getByRole("textbox", { name: /^Título/ })).toHaveValue("Diagnóstico de funciones");
    await expect(page.getByRole("textbox", { name: "Temática" })).toHaveValue("Funciones y modularidad");
  });

  test("keeps future destinations contextual and has no horizontal overflow", async ({ page }) => {
    const response = await page.goto("/preview/assessments/new/objectives");
    expect(response?.status()).toBe(200);
    await expect(page.getByTestId("not-found-page")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
  });

  test("creates, reorders, removes and recovers a local ContentSet", async ({ page }) => {
    await page.getByRole("link", { name: /crear mi primera evaluación/i }).click();
    await page.getByRole("textbox", { name: /^Título/ }).fill("Evaluación de funciones");
    await page.getByRole("button", { name: /continuar a contenidos/i }).click();
    await expect(page).toHaveURL(/\/preview\/assessments\/new\/content$/);
    await expect(page.getByRole("status")).toContainText(/aún no agregas materiales/i);
    await page.getByRole("textbox", { name: /nombre del conjunto/i }).fill("Base de funciones");
    await page.getByRole("button", { name: /agregar material/i }).click();
    await expect(page.getByRole("list", { name: /materiales del conjunto/i })).toContainText("Funciones y modularidad.pdf");
    await page.getByLabel("Material demo").selectOption("material-pptx-workshop");
    await page.getByRole("button", { name: /agregar material/i }).click();
    await expect(page.getByRole("list", { name: /materiales del conjunto/i })).toContainText("Taller de composición.pptx");
    await page.getByRole("button", { name: /guardar conjunto/i }).click();
    await expect(page.getByRole("status")).toContainText(/guardado localmente/i);
    await page.getByRole("button", { name: /eliminar funciones y modularidad/i }).click();
    await expect(page.getByRole("list", { name: /materiales del conjunto/i })).not.toContainText("Funciones y modularidad.pdf");
    await page.getByRole("button", { name: /guardar cambios/i }).click();
    await page.reload();
    await expect(page.getByRole("textbox", { name: /nombre del conjunto/i })).toHaveValue("Base de funciones");
    await expect(page.getByRole("list", { name: /materiales del conjunto/i })).toContainText("Taller de composición.pptx");
  });

  test("shows content states and shared mobile drawer without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/preview/assessments/new/content");
    await page.getByRole("combobox", { name: "Estado de demo" }).selectOption("readonly");
    await expect(page.getByText(/solo lectura: puedes revisar/i)).toBeVisible();
    await expect(page.getByRole("textbox", { name: /nombre del conjunto/i })).toBeDisabled();
    await page.getByRole("button", { name: "Abrir navegación" }).click();
    await expect(page.locator("#teacher-home-nav-mobile")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
  });

  test("supports read-only and save retry states", async ({ page }) => {
    await page.goto("/preview/assessments/new/purpose?access=read-only");
    await expect(page.getByRole("status").filter({ hasText: /solo lectura/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /^Título/ })).toBeDisabled();
    await expect(page.getByRole("textbox", { name: "Temática" })).toBeDisabled();
    await expect(page.getByRole("textbox", { name: "Propósito pedagógico" })).toBeDisabled();
    await expect(page.getByRole("button", { name: /guardar borrador/i })).toBeDisabled();
    await page.goto("/preview/assessments/new/purpose?saveError=1");
    await page.getByRole("textbox", { name: /^Título/ }).fill("Reintento local");
    await page.getByRole("button", { name: /guardar borrador/i }).click();
    await expect(page.getByRole("alert").filter({ hasText: "No se pudo guardar" })).toBeVisible();
    await page.getByRole("button", { name: "Reintentar" }).click();
    await expect(page.getByRole("status")).toContainText("Borrador guardado");
  });

  test("does not overflow at desktop, tablet and phone widths", async ({ page }) => {
    for (const width of [1440, 1024, 768, 430, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/preview/assessments");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
    }
  });
});
