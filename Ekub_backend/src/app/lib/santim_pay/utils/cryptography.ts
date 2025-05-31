import jwt from "jsonwebtoken";

export function sign(
  payload: any,
  privateKey: string,
  algorithm: jwt.Algorithm
): string {
  return jwt.sign(JSON.stringify(payload), privateKey, {
    algorithm,
  });
}

export function signES256(payload: any, privateKey: string): string {
  console.log("payload", { payload, privateKey });
  return sign(payload, privateKey, "ES256");
}
