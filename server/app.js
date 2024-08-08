const http = require("http");
const fs = require("fs");
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const PORT = 8000;

// HTTPS 설정 제거
// const https = require("https");
// const options = {
//   key: fs.readFileSync("/etc/letsencrypt/live/thewavemarket.co.kr/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/thewavemarket.co.kr/fullchain.pem"),
// };

require("dotenv").config();

const server = http.createServer(app);

// const https_server = https.createServer(options, app); // HTTPS 서버 제거

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 60 * 1000,
    },
  })
);

const authRouter = require("./routes/auth");
const mypageRouter = require("./routes/mypage");
const categoryRouter = require("./routes/category");
const productRouter = require("./routes/product");
const paymentRouter = require("./routes/payment");
const cartRouter = require("./routes/cart");
const adminRouter = require("./routes/admin");
const adminUsersRouter = require("./routes/adminUsers");
const adminProductsRouter = require("./routes/adminProducts");
const adminOrdersRouter = require("./routes/adminOrders");

app.use("/api", authRouter);
app.use("/api/mypage", mypageRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/cart", cartRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/users", adminUsersRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrdersRouter);

// http 서버 오픈
server.listen(PORT, function () {
  console.log(`Server Open: ${PORT}`);
});

// HTTPS 서버 오픈 부분 제거
// https_server.listen(https_port, function () {
//   console.log(`HTTPS Server Open: ${https_port}`);
// });
