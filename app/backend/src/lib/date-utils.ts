export const formatDate = (date: Date): string => {
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD}`;
};
