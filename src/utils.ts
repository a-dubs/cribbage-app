export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export const capitalizeAndSpace = (s: string) => {
  return s.split('_').map(capitalize).join(' ');
}