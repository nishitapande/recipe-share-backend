module.exports = function (req, res, next) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://recipe-share-frontend.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
};
