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
exports.getPayments = void 0;
const error_config_1 = require("../../../../config/error.config");
exports.getPayments = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    // Get the start and end date from the query
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    let filter = {};
    if (query.state) {
        filter = Object.assign(Object.assign({}, filter), { state: query.state });
    }
    if (query.paymentMethod) {
        filter = Object.assign(Object.assign({}, filter), { paymentMethod: query.paymentMethod });
    }
    if (query.approved) {
        filter = Object.assign(Object.assign({}, filter), { approved: query.approved == "true" ? true : false });
    }
    if (query._search) {
        filter = Object.assign(Object.assign({}, filter), { equbber: {
                users: {
                    some: {
                        user: {
                            fullName: {
                                contains: query._search,
                                mode: "insensitive",
                            },
                        },
                    },
                },
            } });
    }
    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
        filter = Object.assign(Object.assign({}, filter), { createdAt: {
                gte: startDate,
                lte: endDate,
            } });
    }
    // Add date filtering to the where clause if company BankId
    if (query.companyBankId) {
        filter = Object.assign(Object.assign({}, filter), { companyBankAccountId: query.companyBankId });
    }
    // Add date filtering to the where clause if equbId
    if (query.equbId) {
        filter = Object.assign(Object.assign({}, filter), { equbId: query.equbId });
    }
    //  req.filter = filter;
    req.filters = filter;
    // Sorting logic
    let sortOrder = {};
    if (query.sortBy) {
        if (query.sortBy === "newest") {
            sortOrder = { createdAt: "desc" };
        }
        else if (query.sortBy === "oldest") {
            sortOrder = { createdAt: "asc" };
        }
    }
    req.sortOrder = sortOrder;
    next();
}));
