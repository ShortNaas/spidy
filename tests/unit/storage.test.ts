import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getStorageClient,
  uploadObject,
  getObject,
  getPresignedUrl,
  listObjects,
  deleteObject,
  DEFAULT_BUCKET,
} from "@/lib/storage";

interface MockCommand {
  _type: string;
}

interface MockS3ClientInstance {
  config: {
    forcePathStyle?: boolean;
    endpoint?: string;
    region?: string;
  };
  send: (command: MockCommand) => Promise<unknown>;
}

// Mock @aws-sdk/client-s3 and presigner
vi.mock("@aws-sdk/client-s3", () => {
  const sendMock = vi.fn().mockImplementation((command: MockCommand) => {
    if (command._type === "GetObjectCommand") {
      return Promise.resolve({
        Body: {
          transformToString: () => Promise.resolve('{"mock":"data"}'),
        },
      });
    }
    if (command._type === "ListObjectsV2Command") {
      return Promise.resolve({
        Contents: [{ Key: "reports/test-1.json" }, { Key: "reports/test-2.json" }],
      });
    }
    return Promise.resolve({});
  });

  const S3Client = vi.fn().mockImplementation((config: MockS3ClientInstance["config"]) => ({
    send: sendMock,
    config,
  }));

  class PutObjectCommand implements MockCommand {
    _type = "PutObjectCommand";
    constructor(public input: unknown) {}
  }
  class GetObjectCommand implements MockCommand {
    _type = "GetObjectCommand";
    constructor(public input: unknown) {}
  }
  class ListObjectsV2Command implements MockCommand {
    _type = "ListObjectsV2Command";
    constructor(public input: unknown) {}
  }
  class DeleteObjectCommand implements MockCommand {
    _type = "DeleteObjectCommand";
    constructor(public input: unknown) {}
  }

  return {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://storage.neon.tech/assets/signed-url"),
}));

describe("Neon Object Storage (lib/storage.ts)", () => {
  beforeEach(() => {
    process.env.AWS_ENDPOINT_URL_S3 = "https://test.storage.neon.tech";
    process.env.AWS_ACCESS_KEY_ID = "nak_test_key";
    process.env.AWS_SECRET_ACCESS_KEY = "nsk_test_secret";
    process.env.AWS_REGION = "us-east-2";
  });

  it("configures S3Client with forcePathStyle: true per Neon specs", () => {
    const client = getStorageClient() as unknown as MockS3ClientInstance;
    expect(client.config.forcePathStyle).toBe(true);
    expect(client.config.endpoint).toBe("https://test.storage.neon.tech");
    expect(client.config.region).toBe("us-east-2");
  });

  it("throws error when credentials are not configured", () => {
    delete process.env.AWS_ENDPOINT_URL_S3;
    expect(() => getStorageClient()).toThrow("Neon Object Storage credentials not configured");
  });

  it("uploads an object to the default assets bucket", async () => {
    const res = await uploadObject("reports/summary.json", '{"test":123}');
    expect(res.key).toBe("reports/summary.json");
    expect(res.bucket).toBe(DEFAULT_BUCKET);
    expect(res.size).toBe(12);
  });

  it("reads an object from Neon storage as string", async () => {
    const content = await getObject("reports/summary.json");
    expect(content).toBe('{"mock":"data"}');
  });

  it("generates a presigned URL with expiry", async () => {
    const url = await getPresignedUrl("reports/summary.json", 600);
    expect(url).toContain("https://storage.neon.tech/assets/signed-url");
  });

  it("lists objects in bucket", async () => {
    const keys = await listObjects("reports/");
    expect(keys).toEqual(["reports/test-1.json", "reports/test-2.json"]);
  });

  it("deletes an object cleanly", async () => {
    await expect(deleteObject("reports/summary.json")).resolves.not.toThrow();
  });
});
