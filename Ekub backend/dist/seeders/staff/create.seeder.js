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
exports.createStaffs = void 0;
const db_config_1 = __importDefault(require("../../app/config/db.config"));
const hashedText_1 = require("../../app/utils/hashedText");
function createStaffs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const hashedPassword = yield (0, hashedText_1.hashedString)("123456");
            const superAdminRole = (yield db_config_1.default.role.findUnique({
                where: { name: "Super Admin" },
            }));
            const adminRole = (yield db_config_1.default.role.findUnique({
                where: { name: "Admin" },
            }));
            const branch = yield db_config_1.default.branch.findFirst({ where: { isMain: true } });
            yield db_config_1.default.staff.createMany({
                data: [
                    {
                        firstName: "Super",
                        lastName: "Admin",
                        fullName: "Super Admin",
                        email: "super@equb.com",
                        phoneNumber: "+251983985116",
                        password: hashedPassword,
                        roleId: superAdminRole.id,
                        isActive: true,
                        branchId: branch === null || branch === void 0 ? void 0 : branch.id,
                    },
                    {
                        firstName: "Equb",
                        lastName: "Admin",
                        fullName: "Equb Admin",
                        email: "admin@equb.com",
                        phoneNumber: "+251929336352",
                        password: hashedPassword,
                        roleId: adminRole.id,
                        isActive: true,
                        branchId: branch === null || branch === void 0 ? void 0 : branch.id,
                    },
                ],
                skipDuplicates: true,
            });
        }
        catch (error) {
            console.log("Error seeding staffs");
            console.log(error);
        }
    });
}
exports.createStaffs = createStaffs;
createStaffs().then(() => {
    console.log("Staff seed finished successfully.");
});
