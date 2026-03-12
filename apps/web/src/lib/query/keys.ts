export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const
  },
  notices: {
    all: ["notices"] as const,
    detail: (noticeId: string) => ["notices", noticeId] as const
  },
  rankings: {
    all: ["rankings"] as const
  },
  shop: {
    products: ["shop", "products"] as const
  }
};
