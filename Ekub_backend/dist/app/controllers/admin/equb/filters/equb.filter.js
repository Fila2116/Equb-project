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
exports.getAllEqubs = void 0;
const error_config_1 = require("../../../../config/error.config");
exports.getAllEqubs = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    let filter = {};
    if (query.branch) {
        filter = Object.assign(Object.assign({}, filter), { branchId: query.branch });
    }
    if (query._search) {
        filter = Object.assign(Object.assign({}, filter), { name: query._search });
    }
    if (query.state) {
        filter = Object.assign(Object.assign({}, filter), { state: query.state });
    }
    // Sorting logic
    // let sortOrder: any = {};
    // if (query.sortBy) {
    //   if (query.sortBy === "newest") {
    //     sortOrder = { nextRoundDate: "desc" };
    //   } else if (query.sortBy === "oldest") {
    //     sortOrder = { nextRoundDate: "asc" };
    //   }
    // }
    // Attach filter and sortOrder to the request object
    req.filter = filter;
    // (req as any).sortOrder = sortOrder;
    next();
}));
