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
exports.getEqubs = void 0;
const error_config_1 = require("../../../../config/error.config");
exports.getEqubs = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    if (query.equbType) {
        req.filters = Object.assign(Object.assign({}, req.filters), { equbTypeId: query.equbType });
    }
    if (query.equbCategory) {
        req.filters = Object.assign(Object.assign({}, req.filters), { equbCategoryId: query.equbCategory });
    }
    if (query.user) {
        if (query.status === "joined") {
            req.filters = Object.assign(Object.assign({}, req.filters), { equbers: {
                    some: {
                        users: {
                            some: {
                                userId: query.user,
                            },
                        },
                    },
                } });
        }
        if (query.status === "pending") {
            req.filters = Object.assign(Object.assign({}, req.filters), { equberRequests: {
                    some: {
                        users: {
                            some: {
                                userId: query.user,
                            },
                        },
                    },
                } });
        }
    }
    if (query._search) {
        req.filters = Object.assign(Object.assign({}, req.filters), { name: {
                contains: query._search,
                mode: "insensitive",
            } });
    }
    // let sortOrder: any = {};
    // if (query.sortBy) {
    //   if (query.sortBy === "newest") {
    //     sortOrder = { nextRoundDate: "desc" };
    //   } else if (query.sortBy === "oldest") {
    //     sortOrder = { nextRoundDate: "asc" };
    //   }
    // }
    // Attach filter and sortOrder to the request object
    // (req as any).sortOrder = sortOrder;
    // req.filters = req.query;
    // console.log(`req.filters from middleware`, req.query);
    // let equberUsers = await prisma.equberUser.findMany({where:{userId:query.user},include:{
    //     equber:{
    //       include:{
    //     equb:true
    //       }
    //     },
    //     equberRequest:{
    //       include:{
    //     equb:true
    //       }
    //     }
    // }});
    // return res.json({
    //     msg:"success",
    //     data:{
    //         joinedEqubs:equberUsers.map(equberUser=>equberUser.equber?.equb).filter(equb=>equb!=null),
    //         pendingEqubs:equberUsers.map(equberUser=>equberUser.equberRequest?.equb).filter(equb=>equb!=null)
    //     }
    // })
    next();
}));
