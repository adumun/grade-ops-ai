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

  test("opens the local rubric and keeps future Questions contextual", async ({ page }) => {
    const response = await page.goto("/preview/assessments/new/rubric");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /rúbrica reutilizable/i })).toBeVisible();
    await page.getByRole("link", { name: /continuar a preguntas/i }).click();
    await expect(page.getByTestId("not-found-page")).toBeVisible();
    await expect(page.getByTestId("area-label")).toContainText("Preguntas");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
  });

  test("reflects the route in the reusable authoring progress stepper", async ({ page }) => {
    await page.goto("/preview/assessments/new/purpose");
    await expect(page.locator('[data-layout="authoring-stage"]')).toBeVisible();
    await expect(page.locator('[data-layout="authoring-stage-footer"]')).toBeVisible();
    const progress = page.getByRole("navigation", { name: "Progreso de autoría de la evaluación" });
    await expect(progress.getByRole("link", { name: /1\. propósito — etapa actual/i })).toHaveAttribute("aria-current", "step");

    await page.goto("/preview/assessments/new/content");
    await expect(page.locator('[data-layout="authoring-stage"]')).toBeVisible();
    await expect(page.locator('[data-layout="authoring-stage-footer"]')).toBeVisible();
    await expect(progress.getByLabel(/1\. propósito — completado/i)).toBeVisible();
    await expect(progress.getByRole("link", { name: /2\. contenidos — etapa actual/i })).toHaveAttribute("aria-current", "step");

    await page.goto("/preview/assessments/new/objectives");
    await expect(page.locator('[data-layout="authoring-stage"]')).toBeVisible();
    await expect(page.locator('[data-layout="authoring-stage-footer"]')).toBeVisible();
    await expect(progress.getByLabel(/1\. propósito — completado/i)).toBeVisible();
    await expect(progress.getByLabel(/2\. contenidos — completado/i)).toBeVisible();
    await expect(progress.getByRole("link", { name: /3\. objetivos — etapa actual/i })).toHaveAttribute("aria-current", "step");

    await page.goto("/preview/assessments/new/rubric");
    await expect(page.locator('[data-layout="authoring-stage"]')).toBeVisible();
    await expect(page.locator('[data-layout="authoring-stage-footer"]')).toBeVisible();
    await expect(progress.getByRole("link", { name: /4\. rúbricas — etapa actual/i })).toHaveAttribute("aria-current", "step");
    await expect(progress.locator('[data-progress-state="completed"]')).toHaveCount(3);

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

  test("reaches objectives from ContentSet, creates, edits, deletes and covers a linked material", async ({ page }) => {
    await page.goto("/preview/assessments/new/content");
    await page.getByRole("textbox", { name: /nombre del conjunto/i }).fill("Materiales de funciones");
    await page.getByRole("button", { name: /agregar material/i }).click();
    await page.getByRole("button", { name: /guardar conjunto/i }).click();
    await page.getByRole("link", { name: /continuar a objetivos/i }).click();
    await expect(page).toHaveURL(/\/preview\/assessments\/new\/objectives$/);
    await expect(page.getByRole("heading", { name: /objetivos medibles/i })).toBeVisible();
    await page.getByRole("textbox", { name: "Objetivo medible" }).fill("Aplicar funciones para resolver problemas");
    await page.getByRole("textbox", { name: "Evidencia observable" }).fill("Implementa dos funciones y explica su responsabilidad.");
    await page.getByRole("checkbox", { name: /funciones y modularidad/i }).check();
    await page.getByRole("button", { name: "Agregar objetivo" }).click();
    const objectives = page.getByRole("list", { name: "Objetivos de la evaluación" });
    await expect(objectives).toContainText("Aplicar funciones para resolver problemas");
    await expect(page.getByLabel("100% de cobertura del ContentSet")).toBeVisible();
    await page.getByRole("button", { name: /editar aplicar funciones para resolver problemas/i }).click();
    await page.getByRole("textbox", { name: "Objetivo medible" }).fill("Aplicar funciones reutilizables");
    await page.getByRole("button", { name: "Guardar objetivo", exact: true }).click();
    await expect(objectives).toContainText("Aplicar funciones reutilizables");
    await page.getByRole("button", { name: /eliminar aplicar funciones reutilizables/i }).click();
    await expect(objectives).not.toContainText("Aplicar funciones reutilizables");
    await page.getByRole("button", { name: "Guardar objetivos" }).click();
    await expect(page.getByRole("status").filter({ hasText: /objetivos guardados localmente/i })).toBeVisible();
    await page.getByRole("link", { name: "Volver al ContentSet" }).click();
    await expect(page).toHaveURL(/\/preview\/assessments\/new\/content$/);
  });

  test("keeps the AI proposal under a human decision and exposes all objective states", async ({ page }) => {
    await page.goto("/preview/assessments/new/objectives");
    await expect(page.getByText("Propuesta pendiente")).toBeVisible();
    await expect(page.getByText(/acción humana pendiente/i)).toBeVisible();
    await page.getByRole("button", { name: "Aceptar propuesta" }).click();
    await expect(page.getByText("Propuesta aceptada")).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "Editar propuesta" }).click();
    await page.getByRole("textbox", { name: "Objetivo medible" }).fill("Descomponer problemas mediante funciones");
    await page.getByRole("button", { name: "Guardar objetivo", exact: true }).click();
    await expect(page.getByText("Propuesta editada")).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "Rechazar propuesta" }).click();
    await expect(page.getByText("Propuesta rechazada")).toBeVisible();
  });

  test("shows objective loading, empty, retry, access states and reaches the rubric", async ({ page }) => {
    await page.goto("/preview/assessments/new/objectives");
    await page.getByRole("combobox", { name: "Estado de demo" }).selectOption("loading");
    await expect(page.getByLabel("Cargando objetivos")).toBeVisible();
    await page.goto("/preview/assessments/new/objectives");
    await page.getByRole("combobox", { name: "Estado de demo" }).selectOption("empty");
    await expect(page.getByRole("status").filter({ hasText: /aún no hay objetivos/i })).toBeVisible();
    await page.goto("/preview/assessments/new/objectives?access=read-only");
    await expect(page.getByRole("status").filter({ hasText: /solo lectura/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Objetivo medible" })).toBeDisabled();
    await page.goto("/preview/assessments/new/objectives?access=permission-denied");
    await expect(page.getByRole("alert").filter({ hasText: /no tienes permisos/i })).toBeVisible();
    await page.goto("/preview/assessments/new/objectives?saveError=1");
    await page.getByRole("button", { name: "Guardar objetivos" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /no se pudo guardar/i })).toBeVisible();
    await page.getByRole("button", { name: "Reintentar" }).click();
    await expect(page.getByRole("status").filter({ hasText: /objetivos guardados localmente/i })).toBeVisible();
    await page.getByRole("link", { name: /continuar a rúbrica/i }).click();
    await expect(page).toHaveURL(/\/preview\/assessments\/new\/rubric$/);
    await expect(page.getByRole("heading", { name: /rúbrica reutilizable/i })).toBeVisible();
    for (const width of [1440, 1024, 768, 430, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/preview/assessments/new/objectives");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
    }
  });

  test("authors a reusable rubric with criteria, levels, coverage, decisions and local versioning", async ({ page }) => {
    await page.goto("/preview/assessments/new/rubric");
    await page.getByRole("button", { name: "Agregar criterio" }).click();
    await page.getByRole("textbox", { name: "Nombre del criterio" }).fill("Implementación");
    await page.getByRole("textbox", { name: "Descriptor" }).fill("Entrega una solución modular y comprobable.");
    await page.getByRole("spinbutton", { name: "Peso (%)" }).fill("80");
    await expect(page.getByText(/la suma de pesos debe llegar a 100/i)).toBeVisible();
    await page.getByRole("checkbox", { name: /descomponer un problema/i }).check();
    await page.getByRole("button", { name: "Agregar nivel" }).click();
    await expect(page.getByRole("textbox", { name: "Descriptor" })).toHaveCount(2);
    await page.getByRole("button", { name: "Guardar rúbrica" }).click();
    await expect(page.getByRole("status").filter({ hasText: /rúbrica guardada localmente/i })).toBeVisible();
    await page.getByRole("combobox", { name: "Rúbrica demo" }).selectOption("rubric-demo-ai-pending");
    await expect(page.getByText(/propuesta ia pendiente/i)).toBeVisible();
    await page.getByRole("button", { name: "Aceptar propuesta" }).click();
    await expect(page.getByText(/propuesta aceptada/i)).toBeVisible();
    await page.reload();
    await page.getByRole("combobox", { name: "Rúbrica demo" }).selectOption("rubric-demo-ai-pending");
    await page.getByRole("button", { name: "Editar propuesta" }).click();
    await expect(page.getByText(/propuesta editada/i)).toBeVisible();
    await page.getByRole("button", { name: "Duplicar versión" }).click();
    await expect(page.getByText(/propuesta ia demo: funciones \(copia\)/i)).toBeVisible();
    await page.getByRole("link", { name: "Volver a Objetivos" }).last().click();
    await expect(page).toHaveURL(/\/preview\/assessments\/new\/objectives$/);
  });

  test("supports rubric loading, retry, read-only and responsive layouts", async ({ page }) => {
    await page.goto("/preview/assessments/new/rubric?loadError=1");
    await expect(page.getByRole("alert").filter({ hasText: /no pudimos cargar/i })).toBeVisible();
    await page.getByRole("button", { name: "Reintentar" }).click();
    await expect(page.getByRole("heading", { name: /rúbrica reutilizable/i })).toBeVisible();
    await page.goto("/preview/assessments/new/rubric?access=read-only");
    await expect(page.getByRole("status").filter({ hasText: /solo lectura/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Agregar criterio" })).toBeDisabled();
    await page.goto("/preview/assessments/new/rubric?access=permission-denied");
    await expect(page.getByRole("alert").filter({ hasText: /no tienes permisos/i })).toBeVisible();
    for (const width of [1440, 1024, 768, 430, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/preview/assessments/new/rubric");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
    }
  });
});
