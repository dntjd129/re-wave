require("dotenv").config();
const secret = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");

// 토큰 생성 함수(access, refresh 토큰 반환)
async function generateAccessToken(loginUser) {
  try {
    const payload = {
      userId: loginUser.userId,
      userNumber: loginUser.userNumber,
    };

    const accessToken = jwt.sign(payload, secret, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign(payload, secret, {
      expiresIn: "14d",
    });

    // Redis 대신 직접 반환
    return { accessToken: accessToken, refreshToken: refreshToken };
  } catch (error) {
    console.error(error);
  }
}

// 간편 로그인 토큰 생성 함수
async function generateAccessTokenSNS(loginUser) {
  try {
    const payload = {
      userId: loginUser.userId,
      userNumber: loginUser.userNumber,
    };

    const accessToken = jwt.sign(payload, secret, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign(payload, secret, {
      expiresIn: "14d",
    });

    return { accessToken: accessToken, refreshToken: refreshToken };
  } catch (error) {
    console.error(error);
    return { error: "accessToken 생성 중 오류 발생함" };
  }
}

// 토큰 검증 및 디코딩
const verifyToken = async (accessToken, refreshToken) => {
  // 토큰이 없는 경우
  if (!accessToken) {
    return { result: "no token" };
  }

  const token = accessToken.split(" ")[1];

  try {
    jwt.verify(token, secret); // access 토큰 검증
    const decodeAccessToken = jwt.decode(token);
    return { accessToken: token, userData: decodeAccessToken }; // access 토큰이 만료되지 않은 경우, 토큰과 payload 값 반환
  } catch (error) {
    // access 토큰이 만료된 경우
    const decodedToken = jwt.decode(token);
    try {
      jwt.verify(refreshToken, secret); // refresh 토큰 검증

      const payload = {
        userId: decodedToken.userId,
        userNumber: decodedToken.userNumber,
      };
      const newAccessToken = jwt.sign(payload, secret, {
        expiresIn: "1h",
      });
      const decodeNewAccessToken = jwt.decode(newAccessToken);
      return { accessToken: newAccessToken, userData: decodeNewAccessToken }; // 새 access 토큰 반환
    } catch (error) {
      // refresh 토큰이 만료된 경우
      return { result: "signin again" };
    }
  }
};

// 로그아웃 시 refresh 토큰은 클라이언트 측에서 삭제
const deleteToken = async (accessToken) => {
  const token = accessToken.split(" ")[1];
  const decodedToken = jwt.decode(token);

  try {
    // Access token 만료 처리 (이 경우 클라이언트 측에서 토큰을 제거해야 함)
    return { result: "true" };
  } catch (error) {
    console.error(error);
    return { result: "access token 검증 오류" };
  }
};

module.exports = {
  generateAccessToken,
  verifyToken,
  deleteToken,
  generateAccessTokenSNS,
};
