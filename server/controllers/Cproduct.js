const { db } = require("../models/index");
const { verifyToken } = require("../middleware/jwt");

// 특정 상품 상세 페이지
exports.productPage = async (req, res) => {
  try {
    const productDetail = await db.products.findOne({
      where: { productId: req.params.productId },
    });

    const categoryName = await db.categories.findOne({
      where: { categoryId: productDetail.categoryId },
      attributes: ["categoryName"],
    });

    const productOption = await db.productoption.findOne({
      where: { productId: req.params.productId },
    });

    // productOption.color가 배열인지 JSON 문자열인지 확인
    let colors = [];
    if (productOption.color) {
      if (typeof productOption.color === "string") {
        // JSON 문자열인 경우
        colors = JSON.parse(productOption.color);
      } else if (Array.isArray(productOption.color)) {
        // 이미 배열인 경우
        colors = productOption.color;
      }
    }

    let size = [];
    if (productOption.size) {
      if (typeof productOption.size === "string") {
        // JSON 문자열인 경우
        size = JSON.parse(productOption.size);
      } else if (Array.isArray(productOption.size)) {
        // 이미 배열인 경우
        size = productOption.size;
      }
    }

    res.json({ productDetail, categoryName, productOption, colors, size });
  } catch (error) {
    console.error(error);
    res.status(500).send("상품 상세 페이지 오류");
  }
};

// 찜하기
exports.wish = async (req, res) => {
  const accessToken = req.headers["authorization"];
  const tokenCheck = await verifyToken(accessToken);

  try {
    const checkWishList = await db.wishlist.findOne({
      where: { productId: req.params.productId },
    });

    if (!checkWishList) {
      const wishListIn = await db.wishlist.create({
        productId: req.params.productId,
        userNumber: tokenCheck.userData.userNumber,
      });

      if (wishListIn) res.send({ result: true });
      else res.send({ result: false });
    } else res.send({ result: "동일 상품 존재" });
  } catch (error) {
    console.error(error);
    res.status(500).send("찜하기 오류");
  }
};

// '장바구니 담기' 클릭
exports.cartIn = async (req, res) => {
  const { cartQuantity, color, size } = req.body;
  const productId = req.params.productId;
  const accessToken = req.headers["authorization"];

  try {
    if (accessToken === "Bearer null") {
      return res.send({ result: "guest" }); // 토큰값 없음(==비회원)
    } else {
      const tokenCheck = await verifyToken(accessToken);
      const userNumber = tokenCheck.userData.userNumber;
      // 이미 장바구니에 담긴 상품 있는지 확인
      const sameProduct = await db.carts.findOne({
        where: { userNumber: userNumber, productId: productId },
        attributes: ["cartQuantity"],
      });

      if (sameProduct) {
        const cartIn = await db.carts.update(
          {
            cartQuantity: (sameProduct.cartQuantity += Number(cartQuantity)),
          },
          {
            where: { userNumber: userNumber, productId: productId },
          }
        );
        res.json({ result: true, cart: cartIn });
      } else {
        const cartIn = await db.carts.create({
          productId: productId,
          userNumber: userNumber,
          cartQuantity: cartQuantity,
          color: color,
          size: size,
          isChecked: "0",
        });
        res.json({ result: true, cart: cartIn });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("장바구니 담기 오류");
  }
};
