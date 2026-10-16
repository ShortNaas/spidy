import dns from "node:dns";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dns.setDefaultResultOrder?.("ipv4first");

export const DEFAULT_BUCKET = "assets";

/**
 * Neon Object Storage S3 Client.
 * Configured per Neon Object Storage best practices:
 * - forcePathStyle: true (required by Neon Object Storage)
 * - automatic fallback to AWS-standard env vars injected by `neon deploy`
 */
let s3Client: S3Client | null = null;

export function getStorageClient(): S3Client {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    s3Client = null;
    throw new Error(
      "Neon Object Storage credentials not configured. Please set AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY."
    );
  }

  if (s3Client) return s3Client;

  s3Client = new S3Client({
    endpoint,
    region: process.env.AWS_REGION || "us-east-2",
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3Client;
}

/**
 * Upload an object to a Neon Object Storage bucket.
 */
export async function uploadObject(
  key: string,
  content: string | Uint8Array | Buffer,
  contentType: string = "application/json",
  bucket: string = DEFAULT_BUCKET
): Promise<{ key: string; bucket: string; size: number }> {
  const client = getStorageClient();
  const body = typeof content === "string" ? Buffer.from(content) : content;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return {
    key,
    bucket,
    size: body.length,
  };
}

/**
 * Read an object from a Neon Object Storage bucket as a UTF-8 string.
 */
export async function getObject(key: string, bucket: string = DEFAULT_BUCKET): Promise<string> {
  const client = getStorageClient();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!response.Body) {
    throw new Error(`Empty object body for key '${key}'`);
  }

  return await response.Body.transformToString();
}

/**
 * Generate a presigned GET URL for sharing private objects securely.
 */
export async function getPresignedUrl(
  key: string,
  expiresInSeconds: number = 3600,
  bucket: string = DEFAULT_BUCKET
): Promise<string> {
  const client = getStorageClient();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * List objects in a bucket with an optional prefix.
 */
export async function listObjects(
  prefix: string = "",
  bucket: string = DEFAULT_BUCKET
): Promise<string[]> {
  const client = getStorageClient();
  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    })
  );

  return (response.Contents || []).map((c) => c.Key || "").filter(Boolean);
}

/**
 * Delete an object from a bucket.
 */
export async function deleteObject(key: string, bucket: string = DEFAULT_BUCKET): Promise<void> {
  const client = getStorageClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}
