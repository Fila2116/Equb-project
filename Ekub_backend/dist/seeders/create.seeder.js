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
Object.defineProperty(exports, "__esModule", { value: true });
const create_seeder_1 = require("./branch/create.seeder");
const create_seeder_2 = require("./equb-category/create.seeder");
const create_seeder_3 = require("./equb-type/create.seeder");
const create_seeder_4 = require("./role/create.seeder");
const create_seeder_5 = require("./staff/create.seeder");
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, create_seeder_1.createBranches)();
        yield (0, create_seeder_4.createRoles)();
        yield (0, create_seeder_5.createStaffs)();
        yield (0, create_seeder_2.createEqubCategories)();
        yield (0, create_seeder_3.createEqubTypes)();
    });
}
seed().then(() => {
    console.log("Staff seed finished successfully.");
});
