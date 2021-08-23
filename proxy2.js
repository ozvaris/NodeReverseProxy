const express = require("express");
const colorize = require("json-colorizer");
const app = express();
var cors = require("cors");

app.use(cors());
const { createProxyMiddleware } = require("http-proxy-middleware");

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//https://github.com/chimurai/http-proxy-middleware/issues/320
//app.use(bodyParser.json()) breaks http-proxy-middleware for HTTP POST JSON with express
/**
 * http-proxy-middleware is not compatible with bodyparser and must appear before it without this fix.
 * @see see https://github.com/chimurai/http-proxy-middleware/issues/320
 * @param proxyReq
 * @param req
 */
function fixBody(proxyReq, req) {
  if (!req.body || !Object.keys(req.body).length) {
    return;
  }
  const contentType = proxyReq.getHeader("Content-Type");
  if (contentType.includes("application/json")) {
    writeBody(proxyReq, JSON.stringify(req.body));
  }
  if (contentType === "application/x-www-form-urlencoded") {
    writeBody(proxyReq, querystring.stringify(req.body));
  }
}

function writeBody(proxyReq, bodyData) {
  proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
  proxyReq.write(bodyData);
}

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:3001", //original url
    changeOrigin: true,
    //secure: false,
    pathRewrite(pathReq, req) {
      let url = pathReq;
      console.log(url);
      return url;
    },
    logLevel: "debug",
    onProxyReq: (proxyReq, req) => {
      console.log("request");
      console.log(
        colorize(req.body, {
          pretty: true,
          colors: {
            STRING_KEY: "white",
            STRING_LITERAL: "green",
            NUMBER_LITERAL: "#FF0000",
          },
        })
      );
      // Headers must be set before doing anything to the body.
      if (req?.userContext?.tokens?.access_token) {
        proxyReq.setHeader(
          "Authorization",
          "Bearer " + req.userContext.tokens.access_token
        );
      }
      fixBody(proxyReq, req);
    },
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";

      var body = "";
      proxyRes.on("data", function (data) {
        data = data.toString("utf-8");
        body += data;
        console.log("response");
        console.log(
          colorize(body.toString("utf8"), {
            pretty: true,
            colors: {
              STRING_KEY: "white",
              STRING_LITERAL: "green",
              NUMBER_LITERAL: "#FF0000",
            },
          })
        );
      });
    },
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/", (req, res) => {
  res.send("Hello World!");
});

// Test middleware
app.post("/api", (req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.body);
  next();
});

app.listen(5000);
