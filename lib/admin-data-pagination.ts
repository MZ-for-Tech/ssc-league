type PageError = { code?: string; message?: string } | null;

export async function loadPaginatedRows<Row>(
  count: number | null,
  pageSize: number,
  loadPage: (start: number, end: number) => PromiseLike<{ data: Row[] | null; error: PageError }>,
) {
  const pages = await Promise.all(Array.from({ length: Math.ceil((count ?? 0) / pageSize) }, (_, page) =>
    loadPage(page * pageSize, (page + 1) * pageSize - 1),
  ));
  return {
    rows: pages.flatMap((page) => page.data ?? []),
    errors: pages.map((page) => page.error),
  };
}
