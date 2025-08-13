export const parseJWT = (jwt) => {
  if (!jwt) return null;
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return {
      email: payload.email || payload.sub || null,
      role: payload.role || null,
    };
  } catch {
    return null;
  }
};

export const isTokenExpired = (jwt) => {
  if (!jwt) return true;
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
};