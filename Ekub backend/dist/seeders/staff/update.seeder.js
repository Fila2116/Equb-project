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
const db_config_1 = __importDefault(require("../../app/config/db.config"));
const hashedText_1 = require("../../app/utils/hashedText");
function updateStaffs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const hashedPassword = yield (0, hashedText_1.hashedString)('123456');
            yield db_config_1.default.staff.updateMany({
                data: {
                    password: hashedPassword
                }
            });
        }
        catch (error) {
            console.log('Error updating staffs');
            console.log(error);
        }
    });
}
updateStaffs().then(() => {
    console.log('Staff seed finished successfully.');
});
