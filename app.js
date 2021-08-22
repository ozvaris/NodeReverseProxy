const express = require("express");
var cors = require("cors");
const app = express();
app.use(cors());
const { createProxyMiddleware } = require("http-proxy-middleware");
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://suggest.taobao.com", //original url
    changeOrigin: true,
    //secure: false,
    pathRewrite(pathReq, req) {
      let pathname = pathReq.split("?")[0];
      pathname = pathname.replace("/api", "");
      let url = `${pathname}?abc=1`;
      url = Object.entries(req.query).reduce(
        (newUrl, [key, value]) => `${newUrl}&${key}=${encodeURI(value)}`,
        url
      );
      console.log(url);
      return url;
    },
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    },
  })
);
app.listen(5000);
