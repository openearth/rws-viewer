const dotenv = require("dotenv");

dotenv.config();

module.exports.instances = [
  {
    name: "nl2120",
    datoApiKey: process.env.DATO_API_KEY_NL2120,
    netlifySiteId: "1f6372f6-c532-4e0e-bba7-dee08678d518",
    apiUrl: process.env.API_URL_NL2120,
  },
  {
    name: "openearth-data-viewer",
    datoApiKey: process.env.DATO_API_KEY_OPENEARTH_DATA_VIEWER,
    netlifySiteId: "1785f3f6-b4cf-42de-bea6-b57d48a5c664",
    apiUrl: process.env.API_URL_OPENEARTH_DATA_VIEWER,
  },
  {
    name: "openearth-rws-viewer",
    datoApiKey: process.env.DATO_API_KEY_OPENEARTH_RWS_VIEWER,
    netlifySiteId: "119b8ff3-5b22-4995-b43b-b31f21ba77c3",
    apiUrl: process.env.API_URL_OPENEARTH_RWS_VIEWER,
  },
];
