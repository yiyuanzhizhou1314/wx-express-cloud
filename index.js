const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 微信消息接口
app.get("/api/sendMs", async (req, res) => {
  const request = require('request')
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      url: 'http://api.weixin.qq.com/cgi-bin/message/custom/send',
      // 资源复用情况下，参数from_appid应写明发起方appid
      // url: 'http://api.weixin.qq.com/cgi-bin/message/custom/send?from_appid=wxxxxx'
      body: JSON.stringify({
        touser: "o_HkX0So7PD7GWBL7QQ4KGz5ca_M", // 一般是消息推送body的FromUserName值，为用户的openid
        msgtype: "text",
        text: {
          content: "Hello World111"
        }
      })
    }, function (error, response) {
      console.log('接口返回内容', response.body)
      resolve(JSON.parse(response.body))
      res.send('6666-----'+JSON.parse(response.body))
    })
  })
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send('user openid' + req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
