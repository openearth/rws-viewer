const dotenv = require("dotenv");

dotenv.config();

module.exports.instances = [
  {
    name: "nl2120",
    key: process.env.DATO_API_KEY_NL2120,
  },
  {
    name: "openearth-data-viewer",
    key: process.env.DATO_API_KEY_OPENEARTH_DATA_VIEWER,
  },
  {
    name: "openearth-rws-viewer",
    key: process.env.DATO_API_KEY_OPENEARTH_RWS_VIEWER,
  },
];
