/* --------------------------------------------------------------------------
   calculate skip and limit for pagination
   -------------------------------------------------------------------------- */
export const getPagination = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20)); // cap at 100
  const skip = (pageNum - 1) * limitNum;

  return { skip, limit: limitNum, page: pageNum };
};

/* --------------------------------------------------------------------------
   format paginated response
   -------------------------------------------------------------------------- */
export const getPaginatedResponse = (items, page, limit, total) => {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};
