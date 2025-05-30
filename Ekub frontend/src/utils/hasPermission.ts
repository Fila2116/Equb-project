export const hasPermission = (permissions: string[], suffix: string): boolean => {
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes("all")) return true;
  return permissions.some((perm) => perm.endsWith(suffix));
};