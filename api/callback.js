module.exports = async (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get("code");

  const send = (status, content) => {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(`<html><body><script>
      (function() {
        function receiveMessage(e) {
          window.opener.postMessage(
            'authorization:github:${status}:${JSON.stringify(content)}',
            e.origin
          );
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script></body></html>`);
  };

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      send("error", tokenData);
      return;
    }
    send("success", { token: tokenData.access_token, provider: "github" });
  } catch (err) {
    send("error", { message: err.message });
  }
};
