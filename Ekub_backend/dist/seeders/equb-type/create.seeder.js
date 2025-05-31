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
exports.createEqubTypes = void 0;
const db_config_1 = __importDefault(require("../../app/config/db.config"));
function createEqubTypes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_config_1.default.equbType.createMany({
                data: [
                    {
                        name: "Daily",
                        description: "Daily Equb",
                        interval: 1,
                    },
                    {
                        name: "Weekly",
                        description: "Weekly Equb",
                        interval: 7,
                    },
                    {
                        name: "Monthly",
                        description: "Monthly Equb",
                        interval: 30,
                    },
                ],
            });
        }
        catch (error) {
            console.log("Error seeding equb types");
            console.log(error);
        }
    });
}
exports.createEqubTypes = createEqubTypes;
createEqubTypes().then(() => {
    console.log("Equb type seed finished successfully.");
});
