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
exports.resetFinancePoint = exports.updateEquberFinancePoints = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const updateEquberFinancePoints = (equberId, paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payment = yield db_config_1.default.payment.findUnique({
            where: { id: paymentId },
            include: { equbber: true, equb: true },
        });
        const equber = yield db_config_1.default.equber.findUnique({
            where: { id: equberId },
        });
        const financePoints = equber === null || equber === void 0 ? void 0 : equber.financePoint;
        const adminPoints = equber === null || equber === void 0 ? void 0 : equber.adminPoint;
        const kycPoints = equber === null || equber === void 0 ? void 0 : equber.kycPoint;
        if (!payment || !payment.equb || !equber) {
            throw new Error("Payment or associated equber not found");
        }
        const equbs = payment.equb;
        const expectedPaidAmount = equbs.currentRound * equbs.equbAmount;
        const totalPaid = equber.totalPaid;
        console.log("totalPaid", totalPaid);
        console.log("expectedPaidAmount", expectedPaidAmount);
        if (totalPaid >= expectedPaidAmount) {
            const updatedEquber = yield db_config_1.default.equber.update({
                where: { id: equber.id },
                data: {
                    financePoint: {
                        increment: 20,
                    },
                    totalEligibilityPoint: financePoints + adminPoints + kycPoints + 20,
                },
            });
            return updatedEquber;
        }
    }
    catch (error) {
        console.error("Error updating finance points:", error);
        throw new Error("Failed to update finance points.");
    }
});
exports.updateEquberFinancePoints = updateEquberFinancePoints;
const resetFinancePoint = (equbId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const equb = yield db_config_1.default.equb.findUnique({
            where: { id: equbId },
            include: { equbers: true },
        });
        if (!equb) {
            throw new Error(`Equb with ID ${equbId} not found.`);
        }
        const equberIds = Array.from(new Set(equb.equbers.map((equber) => equber.id)));
        for (const equberId of equberIds) {
            const equberPoint = yield db_config_1.default.equber.findUnique({
                where: { id: equberId },
                select: {
                    financePoint: true,
                    adminPoint: true,
                    kycPoint: true,
                },
            });
            if (!equberPoint) {
                console.warn(`Equber record with ID ${equberId} not found.`);
                continue;
            }
            console.log(`Resetting finance point for Equber ID: ${equberId}`);
            const { financePoint = 0, adminPoint = 0, kycPoint = 0 } = equberPoint;
            console.log("Fetched equberPoint:", equberPoint);
            const updatedEquber = yield db_config_1.default.equber.update({
                where: { id: equberId },
                data: {
                    financePoint: 0,
                    adminPoint: 0,
                    kycPoint: kycPoint,
                    totalEligibilityPoint: kycPoint,
                },
            });
            console.log("updatedEquber", updatedEquber);
            console.log(`Finance points reset for Equber records associated with Equb ID: ${equbId}`);
        }
    }
    catch (error) {
        console.error("Error resetting finance points:", error);
        throw new Error("Failed to reset finance points.");
    }
});
exports.resetFinancePoint = resetFinancePoint;
