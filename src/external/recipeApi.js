import request from "request";
import dotenv from "dotenv";

dotenv.config();

const authKey = process.env.AUTH_KEY;
const serviceId = process.env.SERVICE_ID;
const dataType = "json";
const startIdx = 1;
const endIdx = 100;

/**
 * 식품안전나라 Open API를 통해 레시피를 검색합니다.
 * @param {string} name 검색할 레시피 이름
 * @param {function} callback 결과를 전달받을 콜백 함수
 */
export function searchRecipeFromAPI(name, callback) {
  const uri = `http://openapi.foodsafetykorea.go.kr/api/${authKey}/${serviceId}/${dataType}/${startIdx}/${endIdx}?RCP_NM=${encodeURI(
    name
  )}`;

  request(uri, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        try {
          const jsonObject = JSON.parse(body);
          const recipes = jsonObject.COOKRCP01?.row || [];
          callback(recipes);
        } catch (err) {
          console.error("[recipeApi] JSON parse error:", err);
          callback([]);
        }
      } else {
        console.error("[recipeApi] Request failed:", error);
        callback([]);
      }
    });
}
