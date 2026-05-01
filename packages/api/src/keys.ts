// Query key factories following the hierarchical factory pattern (qk-factory-pattern)

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string | number) => [...productKeys.details(), id] as const,
};

export const cartKeys = {
  all: ["cart"] as const,
  detail: () => [...cartKeys.all, "detail"] as const,
};

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  // list() is intentionally a pass-through alias for lists(); a filters param will be added when paginated/filtered order queries are implemented
  list: () => [...orderKeys.lists()] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string | number) => [...orderKeys.details(), id] as const,
};

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};
