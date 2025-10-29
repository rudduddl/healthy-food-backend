import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//몽고DB 접속
export async function connect() {
  try {
    await client.connect();
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed", err);
    throw err;
  }
}

export function getDB() {
  return client.db("mydb");
}








async function getDisease(id) {
  try {
    const disease = await db
      .collection("disease")
      .findOne({ _id: ObjectId(id) });
    return disease;
  } catch (e) {
    console.error("getDisease error");
    console.error(e);
  }
}
const _getDisease = getDisease;
export { _getDisease as getDisease };

async function searchDisease(keyword) {
  try {
    const option = {};
    if (keyword) option.name = { $regex: keyword };

    const disease = await db
      .collection("disease")
      .find(option)
      .sort({ name: 1 })
      .toArray();

    return disease;
  } catch (e) {
    console.error("searchDisease error");
    console.error(e);
    return [];
  }
}
const _searchDisease = searchDisease;
export { _searchDisease as searchDisease };

async function searchReceipe(keyword) {
  try {
    const receipe = await db
      .collection("receipe")
      .find({ $text: { $search: keyword } }, { projection: { RCP_NM: 1 } })
      .toArray();
    return receipe;
  } catch (e) {
    console.error("searchReceipe error");
    console.error(e);
    return [];
  }
}
const _searchReceipe = searchReceipe;
export { _searchReceipe as searchReceipe };

async function getReceipe(receipeId) {
  try {
    const receipe = db
      .collection("receipe")
      .findOne({ _id: ObjectId(receipeId) });
    return receipe;
  } catch (e) {
    console.error("getReceipe error");
    console.error(e);
    return undefined;
  }
}
const _getReceipe = getReceipe;
export { _getReceipe as getReceipe };

async function getCautionReceipe(caution, keyword, start) {
  function regExp(str) {
    var reg = /[\{\}\[\]\/?.;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    if (reg.test(str)) {
      return str.replace(reg, "");
    } else {
      return str;
    }
  }

  try {
    caution = regExp(caution);
    let split = caution.replace(" ", "").split(",");

    const filtered = split.filter((element) =>
      /*element.includes("식품") ||*/ element.includes("류")
    );
    for (const element of filtered) {
      const result = await db
        .collection("foodClass")
        .findOne({ class: element });

      const reg = [];
      if (result) {
        for (let v of result.value) {
          reg.push(regExp(v));
        }
        split = split.concat(reg);
      }
    }

    const option = [];
    for (const s of split) {
      option.push({ RCP_PARTS_DTLS: { $not: { $regex: s } } });
    }

    const query = { $and: option };
    if (keyword) query.$text = { $search: keyword };

    let receipe = await db
      .collection("receipe")
      .find(query, { projection: { RCP_NM: 1, ATT_FILE_NO_MK: 1 } })
      .skip(start)
      .limit(20)
      .toArray();

    const cursor = db.collection("receipe").aggregate([
      {
        $match: query,
      },
      {
        $count: "total",
      },
    ]);
    let receipeTotalCnt = 0;
    try {
      receipeTotalCnt = (await cursor.toArray())[0].total;
    } catch (e) {}
    return { receipe: receipe, totalCount: receipeTotalCnt };
  } catch (e) {
    console.error("getCautionReceipe error");
    console.error(e);
    return [];
  }
}
const _getCautionReceipe = getCautionReceipe;
export { _getCautionReceipe as getCautionReceipe };

async function favoriteReciepe(user, receipeName) {
  try {
    await db.collection("favoriteReceipe").insertOne({
      id: user,
      receipeId: receipeName,
    });
    return true;
  } catch (e) {
    console.error("favoriteReciepe error");
    console.error(e);
    return false;
  }
}
const _favoriteReciepe = favoriteReciepe;
export { _favoriteReciepe as favoriteReciepe };

async function getFavoriteReceipe(userId) {
  try {
    const result = [];
    const favoriteReceipeIds = await db
      .collection("favoriteReceipe")
      .find({ id: userId })
      .toArray();

    for (const favoriteReciepe of favoriteReceipeIds) {
      var receipe = await db
        .collection("receipe")
        .findOne(
          { _id: ObjectId(favoriteReciepe.receipeId) },
          { projection: { RCP_NM: 1, ATT_FILE_NO_MK: 1 } }
        );

      result.push(receipe);
    }

    return result;
  } catch (e) {
    console.error("getFavoriteReceipe error");
    console.error(e);
  }
}
const _getFavoriteReceipe = getFavoriteReceipe;
export { _getFavoriteReceipe as getFavoriteReceipe };
