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
exports.createRoles = void 0;
const db_config_1 = __importDefault(require("../../app/config/db.config"));
function createRoles() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_config_1.default.role.createMany({
                data: [
                    {
                        type: "super_admin",
                        name: "Super Admin",
                        description: "Super Admin",
                        permissions: ["all"],
                    },
                    {
                        type: "admin",
                        name: "Admin",
                        description: "Admin",
                        permissions: ["user"],
                    },
                ],
            });
        }
        catch (error) {
            console.log("Error seeding roles");
            console.log(error);
        }
    });
}
exports.createRoles = createRoles;
createRoles().then(() => {
    console.log("Role seed finished successfully.");
});
