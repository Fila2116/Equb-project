import fs from "fs";
import path from "path";

const keyPath = path.join(__dirname, "../../../../../hageregna-private.pem");
console.log(keyPath);

export const PRODUCTION_BASE_URL =
  "https://services.santimpay.com/api/v1/gateway";

export const TEST_BASE_URL = "https://testnet.santimpay.com/api/v1/gateway";

// export const TEST_BASE_URL = "http://localhost:16000/api/v1/gateway";
export const devKey = process.env.SANTIMPAY_PRIVATE_KEY;

// Read the PEM files
const prodKey = fs.readFileSync(keyPath, "utf8");
console.log("prodKey: ", prodKey);

// export const PRIVATE_KEY_IN_PEM = devKey;
export const PRIVATE_KEY_IN_PEM =
  process.env.NODE_ENV === "development" ? prodKey : devKey;
console.log("devKey: ", devKey);
console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);
console.log("PRIVATE_KEY_IN_PEM");
console.log(PRIVATE_KEY_IN_PEM);
