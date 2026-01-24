export const getMapboxToken = () => {
  return localStorage.getItem("mapbox_token") || import.meta.env.VITE_MAPBOX_TOKEN || "";
};

export const setMapboxToken = (token: string) => {
  localStorage.setItem("mapbox_token", token);
};
