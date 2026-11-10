import { appClient } from "@/api/appClient";

export async function resolveImageSrc(uri) {
  if (!uri) return "";
  if (uri.startsWith("http")) return uri;
  try {
    const { signed_url } = await appClient.integrations.Core.CreateFileSignedUrl({
      file_uri: uri,
      expires_in: 3600,
    });
    return signed_url;
  } catch {
    return "";
  }
}

export function measureAspect(url) {
  if (!url) return Promise.resolve(4 / 3);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth / img.naturalHeight || 4 / 3);
    img.onerror = () => resolve(4 / 3);
    img.src = url;
  });
}