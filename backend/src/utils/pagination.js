const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const getPagination = (query) => {
  const page = query.page === undefined ? 1 : Number(query.page);
  const requestedLimit = query.limit === undefined ? DEFAULT_LIMIT : Number(query.limit);

  if (!Number.isSafeInteger(page) || page < 1 ||
      !Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
    return null;
  }

  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) return null;
  return { page, limit, skip };
};

const getPaginationMetadata = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
});

const isAllowedFilter = (value, allowedValues) =>
  value === undefined || value === 'all' ||
  (typeof value === 'string' && allowedValues.includes(value));

const isValidSearch = (value) =>
  value === undefined || (typeof value === 'string' && value.length <= 100);

const escapeRegex = (value) => String(value)
  .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  getPagination,
  getPaginationMetadata,
  isAllowedFilter,
  isValidSearch,
  escapeRegex,
};
