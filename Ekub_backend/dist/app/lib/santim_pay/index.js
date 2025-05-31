"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SantimpaySdk = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./utils/constants");
const cryptography_1 = require("./utils/cryptography");
class SantimpaySdk {
    constructor(merchantId, privateKey, testBed = false) {
        this.privateKey = privateKey;
        this.merchantId = merchantId;
        this.baseUrl = testBed ? constants_1.TEST_BASE_URL : constants_1.PRODUCTION_BASE_URL;
        // this.baseUrl = TEST_BASE_URL;
    }
    generateSignedTokenForInitiatePayment(amount, paymentReason) {
        const time = Math.floor(Date.now() / 1000);
        const payload = {
            amount,
            paymentReason,
            merchantId: this.merchantId,
            generated: time,
        };
        // console.log("private key in initialization", this.privateKey);
        return (0, cryptography_1.signES256)(payload, this.privateKey);
    }
    generateSignedTokenForDirectPayment(amount, paymentReason, paymentMethod, phoneNumber) {
        const time = Math.floor(Date.now() / 1000);
        const payload = {
            amount,
            paymentReason,
            paymentMethod,
            phoneNumber,
            merchantId: this.merchantId,
            generated: time,
        };
        return (0, cryptography_1.signES256)(payload, this.privateKey);
    }
    generateSignedTokenForGetTransaction(id) {
        const time = Math.floor(Date.now() / 1000);
        const payload = {
            id,
            merId: this.merchantId,
            generated: time,
        };
        return (0, cryptography_1.signES256)(payload, this.privateKey);
    }
    generatePaymentUrl(id_1, amount_1, paymentReason_1, successRedirectUrl_1, failureRedirectUrl_1, notifyUrl_1) {
        return __awaiter(this, arguments, void 0, function* (id, amount, paymentReason, successRedirectUrl, failureRedirectUrl, notifyUrl, phoneNumber = "", cancelRedirectUrl = "") {
            try {
                const token = this.generateSignedTokenForInitiatePayment(amount, paymentReason);
                // console.log("token", token);
                const payload = {
                    id,
                    amount,
                    reason: paymentReason,
                    merchantId: this.merchantId,
                    signedToken: token,
                    successRedirectUrl,
                    failureRedirectUrl,
                    notifyUrl,
                    cancelRedirectUrl,
                };
                if (phoneNumber && phoneNumber.length > 0) {
                    payload.phoneNumber = phoneNumber;
                }
                // console.log("reached here ");
                const response = yield axios_1.default.post(`${this.baseUrl}/initiate-payment`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // console.log("response from generatePaymentURL", response);
                if (response.status === 200) {
                    return response.data.url;
                }
                else {
                    throw new Error("Failed to initiate payment");
                }
            }
            catch (error) {
                if (error.response && error.response.data) {
                    throw error.response.data;
                }
                // console.log("error", error);
                throw error;
            }
        });
    }
    sendToCustomer(id, amount, paymentReason, phoneNumber, paymentMethod, notifyUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = this.generateSignedTokenForDirectPayment(amount, paymentReason, paymentMethod, phoneNumber);
                const payload = {
                    id,
                    clientReference: id,
                    amount,
                    reason: paymentReason,
                    merchantId: this.merchantId,
                    signedToken: token,
                    receiverAccountNumber: phoneNumber,
                    notifyUrl,
                    paymentMethod,
                };
                const response = yield axios_1.default.post(`${this.baseUrl}/payout-transfer`, payload);
                if (response.status === 200) {
                    return response.data;
                }
                else {
                    throw new Error("Failed to initiate B2C");
                }
            }
            catch (error) {
                if (error.response && error.response.data) {
                    throw error.response.data;
                }
                throw error;
            }
        });
    }
    generateSignedTokenForDirectPaymentOrB2C(amount, paymentReason, paymentMethod, phoneNumber) {
        const time = Math.floor(Date.now() / 1000);
        const payload = {
            amount,
            paymentReason,
            paymentMethod,
            phoneNumber,
            merchantId: this.merchantId,
            generated: time,
        };
        return (0, cryptography_1.signES256)(payload, this.privateKey);
    }
    directPayment(id, amount, paymentReason, notifyUrl, phoneNumber, paymentMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = this.generateSignedTokenForDirectPayment(amount, paymentReason, paymentMethod, phoneNumber);
                const payload = {
                    id,
                    amount,
                    reason: paymentReason,
                    merchantId: this.merchantId,
                    signedToken: token,
                    phoneNumber,
                    paymentMethod,
                    notifyUrl,
                };
                if (phoneNumber && phoneNumber.length > 0) {
                    payload.phoneNumber = phoneNumber;
                }
                const response = yield axios_1.default.post(`${this.baseUrl}/direct-payment`, payload);
                if (response.status === 200) {
                    return response.data;
                }
                else {
                    throw new Error("Failed to initiate direct payment");
                }
            }
            catch (error) {
                if (error.response && error.response.data) {
                    throw error.response.data;
                }
                throw error;
            }
        });
    }
    checkTransactionStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = this.generateSignedTokenForGetTransaction(id);
                const response = yield axios_1.default.post(`${this.baseUrl}/fetch-transaction-status`, {
                    id,
                    merchantId: this.merchantId,
                    signedToken: token,
                });
                if (response.status === 200) {
                    return response.data;
                }
                else {
                    throw new Error("Failed to initiate payment");
                }
            }
            catch (error) {
                if (error.response && error.response.data) {
                    throw error.response.data;
                }
                throw error;
            }
        });
    }
}
exports.SantimpaySdk = SantimpaySdk;
