import { expect, test } from "@playwright/test";

test.describe("local-preview WEBUI-003 assessment evidence", () => {
  test("opens the submission list and restores search context", async ({ page }) => {
    await page.goto("/preview/operations");
    await page.getByRole("textbox", { name: "Buscar operaciones" }).fill("entregas");
    await page.getByRole("button", { name: "Revisar entregas" }).click();
    await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
    await page.getByRole("button", { name: "Reintentar" }).click();
    await expect(page).toHaveURL(/\/preview\/operations\/submissions/);
    await expect(page.getByRole("heading", { name: /Lista de entregas/i })).toBeVisible();
    const reviewLink = page.getByRole("link", { name: "Abrir revisión" }).first();
    const reviewHref = await reviewLink.getAttribute("href");
    expect(reviewHref).toContain("/preview/operations/assessment/");
    await page.goto(reviewHref!);
    await expect(page).toHaveURL(/\/preview\/operations\/assessment\//);
    await expect(page.getByRole("heading", { name: /Preguntas y respuestas/i })).toBeVisible();
    await page.getByRole("link", { name: /Volver a Operaciones/i }).click();
    await expect(page).toHaveURL(/\/preview\/operations\?[^ ]*search=entregas/);
    await expect(page.getByRole("textbox", { name: "Buscar operaciones" })).toHaveValue("entregas");
    await expect(page.getByRole("status").filter({ hasText: "restaurados" })).toBeVisible();
  });

  test("keeps approval and publication as separate capabilities", async ({ page }) => {
    await page.goto("/preview/operations/assessment/quarterly-progress-report");
    await expect(page.getByRole("button", { name: "Aprobar resultado" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Publicar resultado" })).toBeEnabled();
    await expect(page.getByText("Aprobado · listo para publicar")).toBeVisible();
  });

  test("shows localized retry and no horizontal overflow", async ({ page }) => {
    await page.goto("/preview/operations/assessment/api-rest-section-b");
    await page.getByRole("combobox", { name: "Estado de demo" }).selectOption("error");
    await expect(page.getByRole("alert").filter({ hasText: "No pudimos cargar" })).toBeVisible();
    await page.getByRole("button", { name: "Reintentar" }).click();
    await expect(page.getByText("Reintento completado: evidencia demo disponible.")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
  });
});
