import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "@/components/ui/Button";

describe("Button Primitive", () => {
  it("renders a native <button> when href is omitted", () => {
    const html = renderToStaticMarkup(<Button>Click me</Button>);
    expect(html).toMatch(/^<button/);
    expect(html).toContain("Click me");
    expect(html).not.toContain("<a");
  });

  it("renders an <a> (Link) when href is provided, never a button inside link", () => {
    const html = renderToStaticMarkup(<Button href="/register">Create site</Button>);
    expect(html).toMatch(/^<a/);
    expect(html).toContain('href="/register"');
    expect(html).toContain("Create site");
    expect(html).not.toContain("<button");
  });

  it("applies sm size classes px-3 py-1 text-[12px]", () => {
    const buttonHtml = renderToStaticMarkup(<Button size="sm">Small Button</Button>);
    expect(buttonHtml).toContain("px-3 py-1 text-[12px]");

    const linkHtml = renderToStaticMarkup(<Button size="sm" href="/test">Small Link</Button>);
    expect(linkHtml).toContain("px-3 py-1 text-[12px]");
  });

  it("applies md and lg sizes properly", () => {
    const mdHtml = renderToStaticMarkup(<Button size="md">Medium</Button>);
    expect(mdHtml).toContain("px-5 py-2.5");

    const lgHtml = renderToStaticMarkup(<Button size="lg">Large</Button>);
    expect(lgHtml).toContain("px-6 py-3 text-[14px]");
  });

  it("handles disabled state identically on both button and link", () => {
    const buttonHtml = renderToStaticMarkup(<Button disabled>Disabled Button</Button>);
    expect(buttonHtml).toContain("disabled");
    expect(buttonHtml).toContain("opacity-40 cursor-not-allowed pointer-events-none");

    const linkHtml = renderToStaticMarkup(<Button href="/test" disabled>Disabled Link</Button>);
    expect(linkHtml).toContain('aria-disabled="true"');
    expect(linkHtml).toContain('tabindex="-1"');
    expect(linkHtml).toContain("opacity-40 cursor-not-allowed pointer-events-none");
    expect(linkHtml).not.toContain("<button");
  });

  it("includes focus-visible ring styles on both modes", () => {
    const buttonHtml = renderToStaticMarkup(<Button>Focus</Button>);
    expect(buttonHtml).toContain("focus-visible:ring-2 focus-visible:ring-white");

    const linkHtml = renderToStaticMarkup(<Button href="/focus">Focus</Button>);
    expect(linkHtml).toContain("focus-visible:ring-2 focus-visible:ring-white");
  });

  it("renders accent variant with correct classes", () => {
    const html = renderToStaticMarkup(<Button variant="accent">Accent</Button>);
    expect(html).toContain("bg-accent text-canvas");
  });
});
