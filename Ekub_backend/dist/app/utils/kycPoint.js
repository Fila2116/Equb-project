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
exports.addKycPoint = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
function addKycPoint(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield db_config_1.default.user.findUnique({
                where: { id: userId },
                include: {
                    equberUsers: {
                        include: { equber: true },
                    },
                },
            });
            if (!user || !user.equberUsers || user.equberUsers.length === 0) {
                throw new Error("User or associated Equber records not found");
            }
            // Collect all valid equberId values
            const equberIds = Array.from(new Set(user.equberUsers
                .filter((equberUser) => Boolean(equberUser.equberId))
                .map((equberUser) => equberUser.equberId)));
            console.log("equberIds", equberIds);
            if (equberIds.length === 0) {
                console.warn("No valid equberId found for the user.");
                return;
            }
            for (const equberId of equberIds) {
                const equber = yield db_config_1.default.equber.findUnique({
                    where: { id: equberId },
                    select: {
                        financePoint: true,
                        adminPoint: true,
                        kycPoint: true,
                    },
                });
                if (!equber) {
                    console.warn(`Equber record with ID ${equberId} not found.`);
                    continue;
                }
                const { financePoint = 0, adminPoint = 0, kycPoint = 0 } = equber;
                yield db_config_1.default.equber.update({
                    where: { id: equberId },
                    data: {
                        kycPoint: 20,
                        totalEligibilityPoint: financePoint + adminPoint + kycPoint,
                    },
                });
            }
            console.log(`KYC points incremented by 20 for ${equberIds.length} Equber records.`);
        }
        catch (error) {
            console.error("Error adding KYC points:", error);
            throw error;
        }
    });
}
exports.addKycPoint = addKycPoint;
