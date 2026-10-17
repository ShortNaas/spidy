import { test, expect } from "@playwright/test";

test.describe("Embed Snippet Modal & Toast Verification", () => {
  test("complete end-to-end flow: register -> add site -> modal pops up -> centering & copy & toast -> empty dashboard -> header embed", async ({
    page,
    context,
  }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // 1. Register a fresh test account
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const email = `embed-test-${uniqueId}@example.com`;
    const password = "StrongPassword123!";

    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button:has-text("Create account")').click();

    // 2. Arrives at /dashboard/sites/new
    await expect(page).toHaveURL(/\/dashboard\/sites\/new/);
    await page.waitForLoadState("networkidle");

    // 3. Add a new site
    const domainName = `analytics-${uniqueId}.org`;
    await page.locator('input[name="domain"]').fill(domainName);
    await page.locator('button:has-text("Add site")').click();

    // 4. Modal automatically opens centered over the page
    const dialog = page.locator('div[role="dialog"][aria-modal="true"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-labelledby", "embed-snippet-title");

    // Verify Centering requirements: fixed inset-0, flex items-center justify-center, bg-canvas/70, backdrop-blur-sm
    const dialogClasses = await dialog.getAttribute("class");
    expect(dialogClasses).toContain("fixed inset-0");
    expect(dialogClasses).toContain("flex items-center justify-center");
    expect(dialogClasses).toContain("bg-canvas/70");
    expect(dialogClasses).toContain("backdrop-blur-sm");

    // Verify modal box styling: max-w-lg, max-h-[calc(100dvh-2rem)], overflow-y-auto, 32px radius, Surface, hairline border, sheen
    const innerBox = dialog.locator(".bg-surface");
    await expect(innerBox).toBeVisible();
    const innerClasses = await innerBox.getAttribute("class");
    expect(innerClasses).toContain("max-w-lg");
    expect(innerClasses).toContain("max-h-[calc(100dvh-2rem)]");
    expect(innerClasses).toContain("overflow-y-auto");
    expect(innerClasses).toContain("rounded-4xl");
    expect(innerClasses).toContain("border-border");
    expect(innerClasses).toContain("sheen");

    // Verify Wordmark-free header with title in Poppins 500
    const title = dialog.locator("#embed-snippet-title");
    await expect(title).toBeVisible();
    await expect(title).toHaveText("Embed Analytics Tracker");
    const wordmarkInDialog = dialog.locator('text="SPIDY"');
    await expect(wordmarkInDialog).toHaveCount(0);

    // Verify snippet in Raised block with mono text
    const snippetCode = dialog.locator('code[data-testid="embed-snippet"]');
    await expect(snippetCode).toBeVisible();
    const snippetText = await snippetCode.innerText();
    expect(snippetText).toContain('<script defer src="');
    expect(snippetText).toContain('/a.js" data-site=');

    // Verify NO "Done" button
    const doneButton = dialog.locator('button:has-text("Done")');
    await expect(doneButton).toHaveCount(0);

    // Verify focus moves to "Copy snippet" button on open
    const copyButton = dialog.locator('button:has-text("Copy snippet")');
    await expect(copyButton).toBeVisible();
    await expect(copyButton).toBeFocused();

    // 5. Clicking inside the box must not close it
    await innerBox.click();
    await expect(dialog).toBeVisible();

    // 6. Escape closes the box
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // 7. Verify page keeps showing live status indicator and ghost pill "Show snippet"
    const liveIndicator = page.locator('[data-testid="live-status-indicator"]');
    await expect(liveIndicator).toBeVisible();
    await expect(liveIndicator).toContainText("Waiting for first pageview...");

    const showSnippetPill = page.locator('button:has-text("Show snippet")');
    await expect(showSnippetPill).toBeVisible();
    // Focus should have returned to the trigger (or page)
    await expect(showSnippetPill).toBeFocused();

    // 8. Reopen using "Show snippet" ghost pill
    await showSnippetPill.click();
    await expect(dialog).toBeVisible();

    // 9. Clicking outside the box (backdrop) closes it
    await dialog.click({ position: { x: 8, y: 8 } });
    await expect(dialog).toBeHidden();

    // 10. Reopen again, and test "Copy snippet"
    await showSnippetPill.click();
    await expect(dialog).toBeVisible();
    await copyButton.click();

    // Modal closes immediately upon copy
    await expect(dialog).toBeHidden();

    // Toast appears with "Snippet copied"
    const toast = page.locator('div[role="status"][aria-live="polite"]');
    await expect(toast).toBeVisible();
    await expect(toast).toHaveText("Snippet copied");

    // Verify toast design per DESIGN.md: pill at bottom center, Raised background, hairline border
    const toastClasses = await toast.getAttribute("class");
    expect(toastClasses).toContain("fixed bottom-6 left-1/2 -translate-x-1/2");
    expect(toastClasses).toContain("rounded-full");
    expect(toastClasses).toContain("bg-raised");
    expect(toastClasses).toContain("border-border");

    // Verify clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toContain('<script defer src="');
    expect(clipboardContent).toContain('/a.js" data-site=');

    // 11. Navigate to Empty Dashboard
    await page.locator('a:has-text("Skip to dashboard →")').click();
    await page.waitForLoadState("networkidle");

    // Empty dashboard shows "Show snippet" button in EmptyState
    const emptyStateSnippetBtn = page.locator('main button:has-text("Show snippet")');
    await expect(emptyStateSnippetBtn).toBeVisible();
    await emptyStateSnippetBtn.click();

    // Modal opens on empty dashboard
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // 12. Reload page to hydrate layout with new site in header
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Open from Header Code button
    const headerCodeBtn = page.locator('button[aria-label="Embed tracker script"]');
    await expect(headerCodeBtn).toBeVisible();
    await headerCodeBtn.click();

    // Modal is centered and visible
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('button:has-text("Done")')).toHaveCount(0);

    // Copy from header modal
    const headerCopyBtn = dialog.locator('button:has-text("Copy snippet")');
    await headerCopyBtn.click();
    await expect(dialog).toBeHidden();

    // Toast appears again
    await expect(toast).toBeVisible();
    await expect(toast).toHaveText("Snippet copied");
  });
});
