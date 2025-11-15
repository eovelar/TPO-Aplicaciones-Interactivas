// utils/pagination.ts
export function getPagination(query: any) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
