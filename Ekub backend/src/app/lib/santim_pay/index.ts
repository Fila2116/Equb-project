import axios from "axios";
import { PRODUCTION_BASE_URL, TEST_BASE_URL } from "./utils/constants";
import { signES256 } from "./utils/cryptography";

interface IPayload {
  id: string;
  amount: number;
  reason: string;
  merchantId: string;
  signedToken: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
  notifyUrl: string;
  cancelRedirectUrl: string;
  phoneNumber?: string;
}

export class SantimpaySdk {
  privateKey: string;
  merchantId: string;
  baseUrl: string;

  constructor(merchantId: string, privateKey: string, testBed = false) {
    this.privateKey = privateKey;
    this.merchantId = merchantId;
    this.baseUrl = testBed ? TEST_BASE_URL : PRODUCTION_BASE_URL;
    // this.baseUrl = TEST_BASE_URL;
  }

  generateSignedTokenForInitiatePayment(
    amount: number,
    paymentReason: string
  ): string {
    const time = Math.floor(Date.now() / 1000);
    const payload = {
      amount,
      paymentReason,
      merchantId: this.merchantId,
      generated: time,
    };

    // console.log("private key in initialization", this.privateKey);
    return signES256(payload, this.privateKey);
  }

  generateSignedTokenForDirectPayment(
    amount: number,
    paymentReason: string,
    paymentMethod: string,
    phoneNumber: string
  ): string {
    const time = Math.floor(Date.now() / 1000);
    const payload = {
      amount,
      paymentReason,
      paymentMethod,
      phoneNumber,
      merchantId: this.merchantId,
      generated: time,
    };
    return signES256(payload, this.privateKey);
  }

  generateSignedTokenForGetTransaction(id: string): string {
    const time = Math.floor(Date.now() / 1000);
    const payload = {
      id,
      merId: this.merchantId,
      generated: time,
    };
    return signES256(payload, this.privateKey);
  }

  async generatePaymentUrl(
    id: string,
    amount: number,
    paymentReason: string,
    successRedirectUrl: string,
    failureRedirectUrl: string,
    notifyUrl: string,
    phoneNumber: string = "",
    cancelRedirectUrl: string = ""
  ): Promise<string> {
    try {
      const token = this.generateSignedTokenForInitiatePayment(
        amount,
        paymentReason
      );
      // console.log("token", token);
      const payload: IPayload = {
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
      const response = await axios.post(
        `${this.baseUrl}/initiate-payment`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("response from generatePaymentURL", response);

      if (response.status === 200) {
        return response.data.url;
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      // console.log("error", error);
      throw error;
    }
  }

  async sendToCustomer(
    id: string,
    amount: number,
    paymentReason: string,
    phoneNumber: string,
    paymentMethod: string,
    notifyUrl: string
  ) {
    try {
      const token = this.generateSignedTokenForDirectPayment(
        amount,
        paymentReason,
        paymentMethod,
        phoneNumber
      );
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
      const response = await axios.post(
        `${this.baseUrl}/payout-transfer`,
        payload
      );
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to initiate B2C");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  }

  generateSignedTokenForDirectPaymentOrB2C(
    amount: number,
    paymentReason: string,
    paymentMethod: string,
    phoneNumber: string
  ): string {
    const time = Math.floor(Date.now() / 1000);
    const payload = {
      amount,
      paymentReason,
      paymentMethod,
      phoneNumber,
      merchantId: this.merchantId,
      generated: time,
    };
    return signES256(payload, this.privateKey);
  }
  async directPayment(
    id: string,
    amount: number,
    paymentReason: string,
    notifyUrl: string,
    phoneNumber: string,
    paymentMethod: string
  ) {
    try {
      const token = this.generateSignedTokenForDirectPayment(
        amount,
        paymentReason,
        paymentMethod,
        phoneNumber
      );
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
      const response = await axios.post(
        `${this.baseUrl}/direct-payment`,
        payload
      );
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to initiate direct payment");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  }

  async checkTransactionStatus(id: string) {
    try {
      const token = this.generateSignedTokenForGetTransaction(id);
      const response = await axios.post(
        `${this.baseUrl}/fetch-transaction-status`,
        {
          id,
          merchantId: this.merchantId,
          signedToken: token,
        }
      );
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  }
}
