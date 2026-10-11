export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function readImageFile(
  file: File
): Promise<{ data: string; mimeType: string } | { error: string }> {
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Image file is too large (max 5MB)" };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return { data: buffer.toString("base64"), mimeType: file.type };
}
