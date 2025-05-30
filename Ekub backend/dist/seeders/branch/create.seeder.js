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
exports.createBranches = void 0;
const db_config_1 = __importDefault(require("../../app/config/db.config"));
function createBranches() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_config_1.default.branch.createMany({
                data: [
                    {
                        name: "Main Branch",
                        city: "Addis Abeba",
                        isMain: true,
                    },
                ],
            });
        }
        catch (error) {
            console.log("Error seeding branches");
            console.log(error);
        }
    });
}
exports.createBranches = createBranches;
createBranches().then(() => {
    console.log("Branch seed finished successfully.");
});
