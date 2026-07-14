import { createAdminClient } from "./supabase/admin";

const BUCKET = "scal-files";

export async function uploadFile(path: string, file: File) {
  const admin = createAdminClient();
  const buffer = await file.arrayBuffer();
  const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export async function signedUrl(path: string | null, expiresIn = 3600) {
  if (!path) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

export async function listSignedFiles(prefix: string, expiresIn = 3600) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(BUCKET).list(prefix, {
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error || !data) return [];
  return Promise.all(
    data.map(async (item) => ({
      name: item.name,
      createdAt: item.created_at,
      signedUrl: await signedUrl(`${prefix}/${item.name}`, expiresIn),
    })),
  );
}

export async function withSignedUrls<T extends { nota_fiscal_url: string | null; receipt_url: string | null }>(
  installments: T[],
) {
  return Promise.all(
    installments.map(async (inst) => ({
      ...inst,
      nota_fiscal_signed_url: await signedUrl(inst.nota_fiscal_url),
      receipt_signed_url: await signedUrl(inst.receipt_url),
    })),
  );
}
