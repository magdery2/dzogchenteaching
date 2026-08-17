module.exports = (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const host = req.headers.host;
  const protocol = host && host.startsWith("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/callback`;
  const state = Math.random().toString(36).slice(2);

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "repo,user");
  url.searchParams.set("state", state);

  res.writeHead(302, { Location: url.toString() });
  res.end();
};
