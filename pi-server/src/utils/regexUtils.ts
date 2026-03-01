export const isValidFileSystemName = (name: string): boolean => {
  if (!name || name.trim().length === 0) return false;

  const safePattern = /^[a-zA-Z0-9-_]+$/;
  return safePattern.test(name);
};
