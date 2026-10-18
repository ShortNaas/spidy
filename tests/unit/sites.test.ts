import { describe, it, expect } from "vitest";
import { generateSiteId } from "@/app/api/sites/route";
import { collectPayloadSchema } from "@/lib/validate";

describe("Site ID Generation", () => {
  it("produces exactly 10 lowercase hexadecimal characters", () => {
    for (let i = 0; i < 50; i++) {
      const id = generateSiteId();
      expect(id).toHaveLength(10);
      expect(/^[0-9a-f]{10}$/.test(id)).toBe(true);
      expect(id).not.toBe("demo");
      expect(id.startsWith("demo")).toBe(false);
    }
  });

  it("is accepted by collector payload schema", () => {
    const siteId = generateSiteId();
    const result = collectPayloadSchema.safeParse({
      site_id: siteId,
      path: "/docs",
    });
    expect(result.success).toBe(true);
  });
});
