const {
  db,
  db: { Op },
} = require("../models/index");
const { thumbnailUpload, detailUpload } = require("../middleware/imageUpload");

// 전체 등록상품 조회
exports.getAdminAllProducts = async (req, res) => {
  try {
    const products = await db.products.findAll({
      include: [
        {
          model: db.categories,
          as: "category",
          attributes: ["categoryname"],
        },
      ],
    });
    return res.send(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("전체 등록 상품 조회 오류");
  }
};

// 등록상품 삭제 - 체크 박스
exports.deleteAdminProductsChecked = async (req, res) => {
  try {
    const productIds = req.body.productId;
    const isDeleted = await db.products.update(
      { isDeleted: true },
      {
        where: { productId: { [Op.in]: productIds } },
      }
    );

    if (isDeleted[0] > 0) return res.send(true);
    else return res.send(false);
  } catch (error) {
    console.error(error);
    res.status(500).send("등록 상품 삭제 오류");
  }
};

// 상품 등록
exports.createAdminProduct = async (req, res) => {
  try {
    const {
      categoryName,
      productName,
      productPrice,
      productInfo,
      productStatus,
      color,
      size,
    } = req.body;

    // Multer가 저장한 파일 경로 얻기
    const thumbnailUrl = req.file ? req.file.path : null;
    const detailUrls = req.files ? req.files.map((file) => file.path) : [];

    // 카테고리 이름으로 categoryId 찾기
    const category = await db.categories.findOne({ where: { categoryName } });
    if (!category) {
      return res.status(400).send("Invalid categoryName");
    }

    const categoryId = category.categoryId;

    const newProduct = await db.products.create({
      categoryId,
      productName,
      productPrice,
      productInfo,
      productStatus,
      thumbnailUrl,
      detailUrls: detailUrls.join(), // 배열을 문자열로 변환
    });

    const option = await db.productoption.create({
      productId: newProduct.productId, // 상품 ID
      color, // 색상
      size, // 사이즈
    });

    res.send(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send("상품 등록 오류");
  }
};

// 사진 등록 - 썸네일
exports.uploadThumbnail = (req, res, next) => {
  thumbnailUpload.single("thumbnailUrl")(req, res, function (err) {
    if (err) {
      return res.status(400).send(err.message);
    }
    next();
  });
};

// 사진 등록 - 상세 사진
exports.uploadDetails = (req, res, next) => {
  detailUpload.array("detailUrls", 10)(req, res, function (err) {
    if (err) {
      return res.status(400).send(err.message);
    }
    next();
  });
};

// 등록상품 상세 조회
exports.getAdminProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await db.products.findOne({
      where: { productId },
      include: [
        { model: db.categories, as: "category", attributes: ["categoryName"] },
        {
          model: db.productoption,
          as: "productoption",
          attributes: ["color", "size"],
        },
      ],
    });
    return res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).send("등록 상품 상세 조회 오류");
  }
};

// 상품 수정
exports.editAdminProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      categoryName,
      productName,
      productPrice,
      productInfo,
      productStatus,
      color,
      size,
    } = req.body;

    const thumbnailUrl = req.file ? req.file.path : null;
    const detailUrls = req.files ? req.files.map((file) => file.path) : [];

    const category = await db.categories.findOne({ where: { categoryName } });
    if (!category) {
      return res.status(400).send("카테고리명 오류");
    }

    const categoryId = category.categoryId;

    const product = await db.products.findByPk(productId);
    if (!product) {
      return res.status(404).send("상품 조회 오류");
    }

    const updatedProduct = await product.update({
      categoryId,
      productName,
      productPrice,
      productInfo,
      productStatus,
      thumbnailUrl,
      detailUrls: detailUrls.join(), // 배열을 문자열로 변환
    });

    const productOption = await db.productoption.findOne({
      where: { productId },
    });
    if (!productOption) {
      return res.status(404).send("상품 옵션 조회 오류");
    }

    const updatedProductOption = await productOption.update({
      color,
      size,
    });

    res.send({ updatedProduct, updatedProductOption });
  } catch (error) {
    console.error(error);
    res.status(500).send("상품 수정 오류");
  }
};

// 썸네일 사진 수정
exports.editThumbnail = async (req, res) => {
  try {
    const thumbnailUrl = req.file ? req.file.path : null;
    const productId = req.params.productId;

    if (!thumbnailUrl) {
      return res.status(400).send("썸네일 파일이 없습니다.");
    }

    await db.products.update({ thumbnailUrl }, { where: { productId } });
    res.send({ thumbnailUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send("썸네일 수정 오류");
  }
};

// 상세 사진 수정
exports.editDetails = async (req, res) => {
  try {
    const detailUrls = req.files ? req.files.map((file) => file.path) : [];
    const productId = req.params.productId;

    if (detailUrls.length === 0) {
      return res.status(400).send("상세 사진 파일이 없습니다.");
    }

    await db.products.update(
      { detailUrls: detailUrls.join() }, // 배열을 문자열로 변환
      { where: { productId } }
    );
    res.send({ detailUrls });
  } catch (error) {
    console.error(error);
    res.status(500).send("상세 사진 수정 오류");
  }
};

// 등록 상품 삭제
exports.deleteAdminProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const isDeleted = await db.products.update(
      { isDeleted: true },
      { where: { productId } }
    );

    if (isDeleted[0] > 0) return res.send(true);
    else return res.send(false);
  } catch (error) {
    console.error(error);
    res.status(500).send("등록 상품 삭제 오류");
  }
};
