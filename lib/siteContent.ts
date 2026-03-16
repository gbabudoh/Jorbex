import prisma from './prisma';

export async function getSiteContent(section: string): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteContent.findMany({ where: { section } });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}

export async function upsertSiteContent(
  section: string,
  updates: Record<string, string>,
  adminId?: string
) {
  const ops = Object.entries(updates).map(([key, value]) =>
    prisma.siteContent.upsert({
      where: { section_key: { section, key } },
      update: { value, updatedBy: adminId },
      create: { section, key, value, updatedBy: adminId },
    })
  );
  return Promise.all(ops);
}
