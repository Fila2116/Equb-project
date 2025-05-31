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
exports.createEqubCategories = void 0;
const db_config_1 = __importDefault(require("../../app/config/db.config"));
function createEqubCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_config_1.default.equbCategory.createMany({
                data: [
                    {
                        order: 2,
                        name: "Special Finance",
                        description: "Special Finance Equb",
                        needsRequest: true,
                        hasReason: true,
                        isSaving: false,
                    },
                    {
                        name: "Finance",
                        order: 1,
                        description: "Finance only Equb",
                        needsRequest: false,
                        hasReason: false,
                        isSaving: false,
                    },
                    {
                        name: "Travel",
                        order: 3,
                        description: "Travel",
                        needsRequest: false,
                        hasReason: false,
                        isSaving: false,
                    },
                    {
                        name: "Car",
                        order: 4,
                        description: "Car",
                        needsRequest: false,
                        hasReason: false,
                        isSaving: false,
                    },
                    {
                        name: "House",
                        order: 5,
                        description: "House",
                        needsRequest: false,
                        hasReason: false,
                        isSaving: false,
                    },
                ],
                skipDuplicates: true,
            });
        }
        catch (error) {
            console.log("Error seeding equb categories");
            console.log(error);
        }
    });
}
exports.createEqubCategories = createEqubCategories;
createEqubCategories().then(() => {
    console.log("Equb category seed finished successfully.");
});
