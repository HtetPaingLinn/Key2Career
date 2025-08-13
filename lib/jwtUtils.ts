export const parseJWT = (jwt: string | null) => {
  console.log('jwtUtils.ts - parseJWT called with:', jwt);
  if (!jwt) {
    console.log('jwtUtils.ts - No JWT token provided');
    return null;
  }
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    console.log('jwtUtils.ts - Raw payload:', payload);
    const result = {
      email: payload.email || payload.sub || null,
      role: payload.role || null,
      exp: payload.exp || null
    };
    console.log('jwtUtils.ts - Parsed result:', result);
    return result;
  } catch (error) {
    console.error('jwtUtils.ts - Error parsing JWT:', error);
    return null;
  }
};

export const isTokenExpired = (jwt: string | null) => {
  console.log('jwtUtils.ts - isTokenExpired called with:', jwt);
  if (!jwt) {
    console.log('jwtUtils.ts - No JWT token, returning expired=true');
    return true;
  }
  try {
    const payload = parseJWT(jwt);
    console.log('jwtUtils.ts - isTokenExpired payload:', payload);
    if (!payload || !payload.exp) {
      console.log('jwtUtils.ts - No payload or exp field, returning expired=true');
      return true;
    }
    const isExpired = Date.now() >= payload.exp * 1000;
    console.log('jwtUtils.ts - Token expired check:', isExpired, 'Current time:', Date.now(), 'Exp time:', payload.exp * 1000);
    return isExpired;
  } catch (error) {
    console.error('jwtUtils.ts - Error checking expiration:', error);
    return true;
  }
};