const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 8000;

require("dotenv").config();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 경로 설정
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 이미지 업로드를 위한 정적 파일 제공

// 세션 설정
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

// 라우터 설정
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

// 서버 실행
app.listen(PORT, function () {
  console.log(`Server running on http://localhost:${PORT}`);
});
