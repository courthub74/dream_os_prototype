function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,     // true in production (https)
    path: "/"
  };
}

module.exports = { cookieOptions };
