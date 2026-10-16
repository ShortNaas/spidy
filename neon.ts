const config = {
  auth: false,
  buckets: {
    assets: { access: "private" },
  },
  branch: (branch: { isDefault?: boolean; exists?: boolean }) => {
    if (branch.isDefault) {
      return {};
    }
    if (!branch.exists) {
      return { ttl: "7d" };
    }
    return {};
  },
};

export default config;
