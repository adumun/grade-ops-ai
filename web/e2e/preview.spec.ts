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
    await expect(page.locator('[data-layout="shell-header"]')).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("navigates every Operations CTA to the real inbox route", async ({ page }) => {
    await page.goto("/preview");

    await expect(page.locator('#teacher-home-nav a[href="/preview/operations"]')).toHaveAttribute("href", "/preview/operations");
    await expect(page.getByRole("link", { name: /ver todas en operaciones/i })).toHaveAttribute("href", "/preview/operations");
    await expect(page.getByRole("link", { name: "Ver en Operaciones" })).toHaveAttribute("href", "/preview/operations");
    await expect(page.getByRole("button", { name: "Revisar entregas" }).first()).toBeVisible();
    await page.getByRole("button", { name: "Revisar entregas" }).first().click();
    await expect(page).toHaveURL(/\/preview\/operations$/);
    await page.goto("/preview");

    await page.getByRole("link", { name: /ver todas en operaciones/i }).click();
    await expect(page).toHaveURL(/\/preview\/operations$/);
    await expect(page.getByRole("heading", { name: "Bandeja de Operaciones" })).toBeVisible();
  });

  test("navigates to assessment authoring from Inicio and shared navigation", async ({ page }) => {
    await page.goto("/preview");

    const pageHeader = page.locator('[data-layout="page-header"]');
    const shortcuts = page.locator('[aria-labelledby="shortcuts-title"]');
    await expect(pageHeader.getByRole("link", { name: "Nueva evaluación" })).toHaveAttribute("href", "/preview/assessments/new/purpose");
    await expect(shortcuts.getByRole("link", { name: "Nueva evaluación" })).toHaveAttribute("href", "/preview/assessments/new/purpose");

    await shortcuts.getByRole("link", { name: "Nueva evaluación" }).click();
    await expect(page).toHaveURL(/\/preview\/assessments\/new\/purpose$/);
    await page.getByRole("link", { name: "Volver a Evaluaciones" }).click();
    await expect(page).toHaveURL(/\/preview\/assessments$/);
    await expect(page.getByRole("link", { name: "Crear mi primera evaluación" })).toHaveAttribute("href", "/preview/assessments/new/purpose");

    const viewportWidth = await page.evaluate(() => window.innerWidth);
    if (viewportWidth <= 640) {
      await page.goto("/preview");
      await page.getByRole("button", { name: "Abrir navegación" }).click();
      await page.locator("#teacher-home-nav-mobile").getByRole("link", { name: "Evaluaciones" }).click();
    } else {
      await page.goto("/preview");
      await page.locator("#teacher-home-nav").getByRole("link", { name: "Evaluaciones" }).click();
    }
    await expect(page).toHaveURL(/\/preview\/assessments$/);
  });

  test("keeps window fixed while the preview main container scrolls", async ({ page }) => {
    await page.goto("/preview");
    const result = await page.locator("main").evaluate((main) => {
      const content = main as HTMLElement;
      const before = { scrollHeight: content.scrollHeight, clientHeight: content.clientHeight };
      content.scrollTop = content.scrollHeight;
      return { ...before, scrollTop: content.scrollTop, windowScrollY: window.scrollY };
    });

    expect(result.scrollHeight).toBeGreaterThan(result.clientHeight);
    expect(result.scrollTop).toBeGreaterThan(0);
    expect(result.windowScrollY).toBe(0);
    await expect(page.locator('[data-layout="shell-header"]')).toBeVisible();
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    if (viewportWidth > 640) {
      await expect(page.locator("#teacher-home-nav")).toBeVisible();
    } else {
      await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeVisible();
    }
  });

  test("keeps the shell proportions and scroll behavior at the configured viewport", async ({ page }) => {
    await page.goto("/preview");

    const layout = await page.locator("main").evaluate((main) => {
      const page = main.querySelector('[data-layout="page"]') as HTMLElement | null;
      const primary = main.querySelector('[aria-labelledby="attention-title"]')?.getBoundingClientRect();
      const secondary = main.querySelector('[aria-labelledby="upcoming-title"]')?.getBoundingClientRect();
      const grid = page ? getComputedStyle(page).gridTemplateColumns : "";
      return {
        grid,
        ratio: primary && secondary ? primary.width / secondary.width : 0,
      };
    });

    const viewportWidth = await page.evaluate(() => window.innerWidth);
    if (viewportWidth >= 1200) {
      expect(layout.grid.split(" ")).toHaveLength(2);
    } else if (viewportWidth >= 981) {
      expect(layout.grid.split(" ")).toHaveLength(2);
    } else {
      expect(layout.grid.split(" ")).toHaveLength(1);
    }

    await page.locator("main").evaluate((main) => {
      main.scrollTop = main.scrollHeight;
    });
    await expect(page.locator('[data-layout="shell-header"]')).toBeVisible();
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
    const sidebar = page.locator("#teacher-home-nav-mobile");
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
    await expect(page.getByRole("link", { name: /ver todas en operaciones/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Limpiar" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Ver calendario" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Ver en Operaciones" })).toBeDisabled();

    await state.selectOption("empty");
    await expect(page.getByText("No tienes tareas pendientes")).toBeVisible();
    await expect(page.locator('section[aria-labelledby="attention-title"]')).toContainText("No tienes tareas pendientes");
  });

  test("uses one shared demo selector and preserves it across preview navigation", async ({ page }) => {
    await page.goto("/preview");
    const selector = page.getByRole("combobox", { name: "Estado de demo" });
    await expect(selector).toHaveCount(1);
    await selector.selectOption("readonly");
    await expect(page.getByRole("button", { name: "Sin permiso" }).first()).toBeDisabled();

    const viewportWidth = await page.evaluate(() => window.innerWidth);
    if (viewportWidth <= 640) {
      await page.getByRole("button", { name: "Abrir navegación" }).click();
      await page.locator("#teacher-home-nav-mobile").getByRole("link", { name: "Operaciones" }).click();
    } else {
      await page.locator("#teacher-home-nav").getByRole("link", { name: "Operaciones" }).click();
    }

    await expect(page).toHaveURL(/\/preview\/operations$/);
    await expect(page.getByRole("combobox", { name: "Estado de demo" })).toHaveCount(1);
    await expect(page.getByRole("combobox", { name: "Estado de demo" })).toHaveValue("readonly");
    await expect(page.getByRole("button", { name: "Sin permiso" }).first()).toBeDisabled();
  });

  test("has no horizontal overflow at the configured viewport", async ({ page }) => {
    await page.goto("/preview");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

  test("shares page geometry between Inicio and Operaciones", async ({ page }) => {
    const measurements = [] as Array<{ paddingLeft: string; paddingRight: string; pageLeft: number; headerLeft: number; inlineStyle: string | null }>;
    for (const route of ["/preview", "/preview/operations"]) {
      await page.goto(route);
      measurements.push(await page.locator("main").evaluate((main) => {
        const pageElement = main.querySelector('[data-layout="page"]') as HTMLElement;
        const pageHeader = main.querySelector('[data-layout="page-header"]') as HTMLElement;
        const mainStyle = getComputedStyle(main);
        return {
          paddingLeft: mainStyle.paddingLeft,
          paddingRight: mainStyle.paddingRight,
          pageLeft: pageElement.getBoundingClientRect().left,
          headerLeft: pageHeader.getBoundingClientRect().left,
          inlineStyle: pageElement.getAttribute("style"),
        };
      }));
    }

    expect(measurements[0]).toEqual(measurements[1]);
    expect(measurements[0].inlineStyle).toBeNull();
  });

  test("shares filter and row action primitives between both pages", async ({ page }) => {
    const actionHeights: number[] = [];
    for (const [route, fieldCount] of [["/preview", 4], ["/preview/operations", 5]] as const) {
      await page.goto(route);
      await expect(page.locator('[data-testid="filter-bar"]')).toHaveCount(1);
      await expect(page.locator('[data-filter-field="true"]')).toHaveCount(fieldCount);
      await expect(page.getByRole("button", { name: "Limpiar" })).toBeVisible();

      const filterLayout = await page.locator('[data-testid="filter-bar"]').evaluate((bar) => {
        const fields = [...bar.querySelectorAll<HTMLElement>('[data-filter-field="true"]')];
        const clear = bar.querySelector<HTMLElement>('[class*="clearFilters"]');
        return { fieldsDoNotOverlap: fields.every((field, index) => fields.slice(index + 1).every((next) => field.getBoundingClientRect().right <= next.getBoundingClientRect().left || field.getBoundingClientRect().bottom <= next.getBoundingClientRect().top)), clearLeft: clear?.getBoundingClientRect().left ?? 0 };
      });
      expect(filterLayout.fieldsDoNotOverlap).toBe(true);
      expect(filterLayout.clearLeft).toBeGreaterThan(0);

      const reviewAction = page.locator('[data-action-kind="primary"]', { hasText: "Revisar entregas" }).first();
      await expect(reviewAction).toBeVisible();
      expect(await reviewAction.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(32);
      actionHeights.push(await reviewAction.evaluate((element) => element.getBoundingClientRect().height));
      await expect(reviewAction).toHaveClass(/ActionPrimitives_primaryAction/);
      await expect(page.locator('[data-testid="row-action-group"]').first()).toBeVisible();
    }

    expect(actionHeights[0]).toBe(actionHeights[1]);
  });

  test("keeps an unimplemented route inside the shared shell", async ({ page }) => {
    const routes = [
      ["/preview/calendario", "Calendario"],
      ["/preview/recursos", "Recursos"],
      ["/preview/reportes", "Reportes"],
      ["/preview/ruta-inexistente", "Ruta inexistente"],
    ] as const;

    for (const [route, areaLabel] of routes) {
      const response = await page.goto(route);

      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { name: "Todavía no es evaluable" })).toBeVisible();
      await expect(page.locator('[data-testid="not-found-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="requested-path"]')).toHaveText(route);
      await expect(page.locator('[data-testid="area-label"]')).toHaveText(`Área: ${areaLabel}`);
      await expect(page.locator('[data-layout="shell-header"]')).toBeVisible();
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      if (viewportWidth > 640) {
        await expect(page.locator("#teacher-home-nav")).toBeVisible();
      } else {
        await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeVisible();
      }
      await expect(page).toHaveURL(new RegExp(`${route.replaceAll("/", "\\/")}$`));
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
    }

    await page.getByRole("link", { name: "Volver al Inicio" }).click();
    await expect(page).toHaveURL(/\/preview$/);
  });
});

test.describe("local-preview /preview/operations", () => {
  test("renders four queues, filters and no horizontal overflow", async ({ page }) => {
    const response = await page.goto("/preview/operations");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Bandeja de Operaciones" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Preparar" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Revisar" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "Confirmar" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Aprobar" })).toBeVisible();
    await page.getByRole("textbox", { name: "Buscar operaciones" }).fill("feedback");
    await expect(page.getByText("No hay coincidencias")).toBeVisible();
    await page.getByRole("tab", { name: "Confirmar" }).click();
    await expect(page.getByText("Confirmar feedback generado por IA")).toBeVisible();
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("keeps window fixed while the operations content container scrolls", async ({ page }) => {
    await page.goto("/preview/operations");
    const result = await page.locator("main").evaluate((main) => {
      const content = main as HTMLElement;
      const before = { scrollHeight: content.scrollHeight, clientHeight: content.clientHeight };
      content.scrollTop = content.scrollHeight;
      return { ...before, scrollTop: content.scrollTop, windowScrollY: window.scrollY };
    });

    expect(result.scrollHeight).toBeGreaterThan(result.clientHeight);
    expect(result.scrollTop).toBeGreaterThan(0);
    expect(result.windowScrollY).toBe(0);
    await expect(page.locator('[data-layout="shell-header"]')).toBeVisible();
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    if (viewportWidth > 640) {
      await expect(page.locator("#operations-inbox-nav")).toBeVisible();
    } else {
      await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeVisible();
    }
  });

  test("supports error retry, read-only and context preservation", async ({ page }) => {
    await page.goto("/preview/operations");
    await page.getByRole("combobox", { name: "Estado de demo" }).selectOption("error");
    await expect(page.getByRole("alert").filter({ hasText: "No pudimos cargar" })).toBeVisible();
    await page.getByRole("button", { name: "Reintentar" }).click();
    await expect(page.getByRole("tab", { name: "Revisar" })).toHaveAttribute("aria-selected", "true");

    await page.getByRole("combobox", { name: "Estado de demo" }).selectOption("readonly");
    await expect(page.getByRole("button", { name: "Sin permiso" }).first()).toBeDisabled();
    await page.getByRole("textbox", { name: "Buscar operaciones" }).fill("entregas");
    await page.getByRole("button", { name: "Ver contexto" }).first().click();
    await expect(page.getByRole("button", { name: "Volver a la bandeja" })).toBeVisible();
    await page.getByRole("button", { name: "Volver a la bandeja" }).click();
    await expect(page.getByRole("textbox", { name: "Buscar operaciones" })).toHaveValue("entregas");
  });

  test("opens the mobile navigation drawer", async ({ page }) => {
    await page.goto("/preview/operations");
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    if (viewportWidth > 640) {
      await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeHidden();
      return;
    }
    const menu = page.getByRole("button", { name: "Abrir navegación" });
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await page.locator("#operations-inbox-nav-mobile").getByRole("button", { name: "Cerrar navegación" }).click();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
  });
});
