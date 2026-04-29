import crypto from "crypto";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function parseCloudinaryUrl(): CloudinaryConfig {
  const raw = process.env.CLOUDINARY_URL;
  if (!raw) {
    throw new Error("CLOUDINARY_URL ontbreekt");
  }

  const url = new URL(raw);
  const cloudName = url.hostname;
  const apiKey = decodeURIComponent(url.username);
  const apiSecret = decodeURIComponent(url.password);

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_URL heeft een ongeldig formaat");
  }

  return { cloudName, apiKey, apiSecret };
}

function buildSignature(params: Record<string, string>, apiSecret: string) {
  const serialized = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export async function uploadToCloudinary(file: File, folder: string, resourceType: "image" | "raw" | "auto") {
  const { cloudName, apiKey, apiSecret } = parseCloudinaryUrl();
  const timestamp = `${Math.floor(Date.now() / 1000)}`;

  const signature = buildSignature({ folder, timestamp }, apiSecret);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`Cloudinary upload mislukt: ${errorPayload}`);
  }

  const payload = (await response.json()) as { secure_url: string };
  return payload.secure_url;
}
