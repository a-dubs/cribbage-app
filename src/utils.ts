export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export const capitalizeAndSpace = (s: string) => {
  return s.split('_').map(capitalize).join(' ');
}

export const saveLoginInfoToLocalStorage = (name: string, username: string) => {
  localStorage.setItem('name', name);
  localStorage.setItem('username', username);
}

export const getUsernameFromLocalStorage = () => {
  return localStorage.getItem('username');
}

export const getNameFromLocalStorage = () => {
  return localStorage.getItem('name');
}
