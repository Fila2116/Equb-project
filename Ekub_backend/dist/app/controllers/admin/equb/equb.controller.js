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
exports.getPaymentHistory = exports.getEqubClaimer = exports.userPayment = exports.deleteEqub = exports.closeEqub = exports.getFinanceAndOtherMobile = exports.getFinanceAndOther = exports.deleteNotifications = exports.getNotifications = exports.ChartData = exports.getEqubWinners = exports.getEqubStats = exports.getLotteryRequests = exports.markEqubberAsPaid = exports.getLottery = exports.setLottery = exports.updateEqub = exports.createEqub = exports.updateEqubMemberEligibility = exports.getEqubMember = exports.getEqubStat = exports.getExportEqubMembers = exports.getEqubMembers = exports.getEqub = exports.getClosedEqubs = exports.getRegisteringEqubs = exports.getRunningEqubs = exports.getEqubs = exports.getAllEqubs = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const client_1 = require("@prisma/client");
const web_socket_service_1 = require("../../../shared/web-socket/services/web-socket.service");
const event_name_enum_1 = require("../../../shared/web-socket/enums/event-name.enum");
const get_eligible_equbers_helper_1 = require("./helper/get-eligible-equbers.helper");
const date_helper_1 = require("../../../shared/helpers/date.helper");
const get_equb_stat_helper_1 = require("./helper/get-equb-stat.helper");
const dayjs_1 = __importDefault(require("dayjs"));
const notification_service_1 = require("../../../shared/notification/services/notification.service");
const payment_helper_1 = require("../../user/equb/helper/payment.helper");
exports.getAllEqubs = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    // Get the start and end date from the query
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const filter = req.filter || {};
    if (query._search) {
        filter.name = {
            contains: query._search,
            mode: "insensitive",
        };
    }
    if (query.equbType) {
        filter.equbType = { name: query.equbType };
    }
    if (query.equbCategory) {
        filter.equbCategory = { name: query.equbCategory };
    }
    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
        filter.createdAt = {
            gte: startDate,
            lte: endDate,
        };
    }
    // Fetch all entries without pagination for sorting
    const allEqubs = yield db_config_1.default.equb.findMany({
        where: filter,
        include: {
            equbType: {
                select: {
                    id: true,
                    name: true,
                },
            },
            equbCategory: {
                select: {
                    id: true,
                    name: true,
                    isSaving: true,
                },
            },
            branch: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    // Sorting logic based on the difference from currentDate to nextRoundDate
    if (query.sortBy) {
        if (query.sortBy === "newest") {
            // Sort by the soonest nextRoundDate (ascending order)
            allEqubs.sort((a, b) => {
                const dateA = a.nextRoundDate
                    ? new Date(a.nextRoundDate).getTime()
                    : Infinity; // Use Infinity if null
                const dateB = b.nextRoundDate
                    ? new Date(b.nextRoundDate).getTime()
                    : Infinity; // Use Infinity if null
                return dateA - dateB; // Ascending order
            });
        }
        else if (query.sortBy === "oldest") {
            // Sort by the farthest nextRoundDate (descending order)
            allEqubs.sort((a, b) => {
                const dateA = a.nextRoundDate
                    ? new Date(a.nextRoundDate).getTime()
                    : -Infinity; // Use -Infinity if null
                const dateB = b.nextRoundDate
                    ? new Date(b.nextRoundDate).getTime()
                    : -Infinity; // Use -Infinity if null
                return dateB - dateA; // Descending order
            });
        }
    }
    // Count total entries for pagination
    const totalCount = allEqubs.length; // Total entries after filtering
    // Respond with the sorted and paginated data
    res.status(200).json({
        status: "success",
        data: {
            equbs: allEqubs,
            meta: {
                total: totalCount,
            },
        },
    });
}));
exports.getEqubs = (0, error_config_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [equbs, totalCount] = yield Promise.all([
        db_config_1.default.equb.findMany(),
        db_config_1.default.equb.count()
    ]);
    res.status(200).json({
        status: "success",
        data: {
            equbs,
            totalCount
        },
    });
}));
exports.getRunningEqubs = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const [runningEqubs, total] = yield Promise.all([
        db_config_1.default.equb.findMany({
            where: { status: "started" },
            include: {
                equbType: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                equbCategory: {
                    select: {
                        id: true,
                        name: true,
                        isSaving: true,
                    },
                },
                branch: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            take: limit,
            skip,
        }),
        db_config_1.default.equb.count({ where: { status: "started" } }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            runningEqubs,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getRegisteringEqubs = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const [registeringEqubs, total] = yield Promise.all([
        db_config_1.default.equb.findMany({
            where: {
                status: "registering",
            },
            include: {
                equbType: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                equbCategory: {
                    select: {
                        id: true,
                        name: true,
                        isSaving: true,
                    },
                },
                branch: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            take: limit,
            skip,
        }),
        db_config_1.default.equb.count({
            where: {
                status: "registering",
            },
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            registeringEqubs,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getClosedEqubs = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const [closedEqubs, total] = yield Promise.all([
        db_config_1.default.equb.findMany({
            where: { status: "completed" },
            include: {
                equbType: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                equbCategory: {
                    select: {
                        id: true,
                        name: true,
                        isSaving: true,
                    },
                },
                branch: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            take: limit,
            skip,
        }),
        db_config_1.default.equb.count({ where: { status: "completed" } }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            closedEqubs,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getEqub = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = yield db_config_1.default.equb.findUnique({
        where: {
            id: req.params.id,
        },
        include: {
            equbType: {
                select: {
                    id: true,
                    name: true,
                },
            },
            equbCategory: {
                select: {
                    id: true,
                    name: true,
                    isSaving: true,
                },
            },
            branch: {
                select: {
                    id: true,
                    name: true,
                },
            },
            equbers: {
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
        },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            equb,
        },
    });
}));
exports.getEqubMembers = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const equb = yield db_config_1.default.equb.findUnique({ where: { id: req.params.id } });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    const filter = {
        equbId: req.params.id,
    };
    if (query._search) {
        filter.users = {
            some: {
                user: {
                    fullName: {
                        contains: query._search,
                        mode: "insensitive",
                    },
                },
            },
        };
    }
    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
        filter.createdAt = {
            gte: startDate,
            lte: endDate,
        };
    }
    // Add date filtering to the where clause if LOTTERY_NUMBER
    if (query.lotteryNumber) {
        filter.lotteryNumber = {
            equals: query.lotteryNumber,
        };
    }
    const orderBy = query.sortBy === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };
    const [equbers, total] = yield Promise.all([
        db_config_1.default.equber.findMany({
            where: filter,
            take: limit,
            skip,
            include: {
                users: {
                    include: { user: true },
                },
            },
            orderBy,
        }),
        db_config_1.default.equber.count({
            where: filter,
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            members: equbers,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getExportEqubMembers = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const equb = yield db_config_1.default.equb.findUnique({ where: { id: req.params.id } });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    const filter = {
        equbId: req.params.id,
    };
    if (query._search) {
        filter.users = {
            some: {
                user: {
                    fullName: {
                        contains: query._search,
                        mode: "insensitive",
                    },
                },
            },
        };
    }
    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
        filter.createdAt = {
            gte: startDate,
            lte: endDate,
        };
    }
    // Add date filtering to the where clause if LOTTERY_NUMBER
    if (query.lotteryNumber) {
        filter.lotteryNumber = {
            equals: query.lotteryNumber,
        };
    }
    const orderBy = query.sortBy === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };
    const [equbers, total] = yield Promise.all([
        db_config_1.default.equber.findMany({
            where: filter,
            include: {
                users: {
                    include: { user: true },
                },
            },
            orderBy,
        }),
        db_config_1.default.equber.count({
            where: filter,
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            members: equbers,
            meta: {
                total,
            },
        },
    });
}));
exports.getEqubStat = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const equb = yield db_config_1.default.equb.findUnique({ where: { id: req.params.id } });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    const stat = yield (0, get_equb_stat_helper_1.getEqubStatistics)(equb);
    res.status(200).json({
        status: "success",
        data: {
            stat,
        },
    });
}));
exports.getEqubMember = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Fetch equber with only the required fields to calculate totalEligibilityPoint
    const equberPoints = yield db_config_1.default.equber.findUnique({
        where: {
            id: req.params.id,
        },
        select: {
            id: true,
            financePoint: true,
            kycPoint: true,
            adminPoint: true,
        },
    });
    if (!equberPoints) {
        return next(new app_error_1.default(`Equber with ID ${req.params.id} does not exist`, 400));
    }
    // Calculate total eligibility based on the individual points
    const totalEligibilityPoint = Number(equberPoints.adminPoint) +
        Number(equberPoints.financePoint) +
        Number(equberPoints.kycPoint);
    // Step 2: Update the equber with the calculated totalEligibilityPoint
    const updatedEquber = yield db_config_1.default.equber.update({
        where: {
            id: req.params.id,
        },
        data: {
            totalEligibilityPoint, // Update with calculated total eligibility
        },
        include: {
            users: {
                include: {
                    user: {
                        include: {
                            equberUsers: {
                                select: { id: true },
                            },
                            bankAccounts: true,
                        },
                    },
                    guarantee: true,
                    guaranteeUser: true,
                },
            },
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            member: updatedEquber,
        },
    });
}));
exports.updateEqubMemberEligibility = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { adminPoint, excluded, included, show } = req.body;
    // const equbers = await prisma.equber.findUnique({
    //   where: {
    //     id: req.params.id,
    //   },
    //   include: {
    //     users: true,
    //   },
    // });
    // const takenEqub = equbers?.users[0].hasTakenEqub
    let equber = yield db_config_1.default.equber.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!equber) {
        return next(new app_error_1.default(`Equber with ID ${req.params.id} does not exist`, 400));
    }
    const { financePoint, kycPoint } = equber;
    equber = yield db_config_1.default.equber.update({
        where: {
            id: req.params.id,
        },
        data: {
            adminPoint: Number(adminPoint),
            totalEligibilityPoint: Number(Number(adminPoint) + Number(financePoint) + Number(kycPoint)),
            excluded: excluded,
            included: included,
            show: show,
        },
        include: {
            users: {
                include: {
                    user: true,
                },
            },
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            member: equber,
        },
    });
}));
exports.createEqub = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { name, description, equbTypeId, equbCategoryId, numberOfEqubers, branchId, startDate, equbAmount, groupLimit, serviceCharge, goal, other, endDate, } = req.body;
    const equbType = yield db_config_1.default.equbType.findUnique({
        where: { id: equbTypeId },
    });
    if (!equbType) {
        return next(new app_error_1.default(`Equb type with ID ${equbTypeId} does not exist`, 400));
    }
    const equbCategory = yield db_config_1.default.equbCategory.findUnique({
        where: { id: equbCategoryId },
    });
    if (!equbCategory) {
        return next(new app_error_1.default(`Equb category with ID ${equbCategoryId} does not exist`, 400));
    }
    if (branchId) {
        const branch = yield db_config_1.default.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            return next(new app_error_1.default(`Branch with ID ${req.params.id} does not exist`, 400));
        }
    }
    const mainBranch = yield db_config_1.default.branch.findFirst({
        where: { isMain: true },
    });
    // Set nextRoundDate to null if the equbCategory is Car, House, or Travel
    const nextRoundDate = ["Car", "House", "Travel"].includes(equbCategory.name)
        ? null
        : endDate
            ? new Date(endDate)
            : new Date(startDate);
    const equb = yield db_config_1.default.equb.create({
        data: {
            name: name,
            description: description ? description : "",
            equbTypeId: equbTypeId,
            equbCategoryId: equbCategoryId,
            numberOfEqubers: Number(numberOfEqubers),
            equbAmount: Number(equbAmount),
            staffId: (_a = req.staff) === null || _a === void 0 ? void 0 : _a.id,
            branchId: branchId ? branchId : mainBranch === null || mainBranch === void 0 ? void 0 : mainBranch.id,
            startDate: new Date(startDate),
            nextRoundDate: nextRoundDate,
            groupLimit: Number(groupLimit),
            serviceCharge: Number(serviceCharge),
            goal: goal ? parseFloat(goal) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            other: other ? other : "",
        },
        include: {
            equbType: {
                select: {
                    id: true,
                    name: true,
                },
            },
            equbCategory: {
                select: {
                    id: true,
                    name: true,
                    isSaving: true,
                },
            },
            branch: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.equb,
            staffId: (_b = req.staff) === null || _b === void 0 ? void 0 : _b.id,
            equbId: equb.id,
            description: `${(_c = req.staff) === null || _c === void 0 ? void 0 : _c.fullName} created a new equb - ${equb.name}.`,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            equb,
        },
    });
}));
exports.updateEqub = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const { name, description, numberOfEqubers, startDate, equbAmount, groupLimit, serviceCharge, endDate, goal, other, } = req.body;
    const updatedData = {
        name,
    };
    if (description)
        updatedData.description = description;
    if (startDate) {
        updatedData.startDate = new Date(startDate);
        // updatedData.nextRoundDate = new Date(startDate);
    }
    if (endDate)
        updatedData.endDate = new Date(endDate);
    if (goal)
        updatedData.goal = parseFloat(goal);
    if (numberOfEqubers)
        updatedData.numberOfEqubers = Number(numberOfEqubers);
    if (equbAmount)
        updatedData.equbAmount = Number(equbAmount);
    if (groupLimit)
        updatedData.groupLimit = Number(groupLimit);
    if (serviceCharge)
        updatedData.serviceCharge = Number(serviceCharge);
    if (other)
        updatedData.other = other;
    const equb = yield db_config_1.default.equb.update({
        where: { id: req.params.id },
        data: updatedData,
        include: {
            equbType: {
                select: {
                    id: true,
                    name: true,
                },
            },
            equbCategory: {
                select: {
                    id: true,
                    name: true,
                    isSaving: true,
                },
            },
            branch: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb type with ID ${req.params.id} does not exist`, 400));
    }
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.equb,
            staffId: (_d = req.staff) === null || _d === void 0 ? void 0 : _d.id,
            description: `${(_e = req.staff) === null || _e === void 0 ? void 0 : _e.fullName} updated an equb`,
            equbId: equb.id,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            equb,
        },
    });
}));
exports.setLottery = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { nextRoundDate, nextRoundTime, currentRoundWinners, nextRoundLotteryType, notifyAllMembers, } = req.body;
    let equb = yield db_config_1.default.equb.findUnique({
        where: { id: req.params.id },
        include: {
            equbers: {
                select: { id: true, hasWonEqub: true },
            },
        },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    // const equbersWhoHaveNotWon = equb.equbers.filter(equber=>equber.hasWonEqub === false );
    // if(currentRoundWinners>equbersWhoHaveNotWon){
    //   return next(
    //     new AppError(`Number of winners could not exceed number of remaining equbers.`, 400)
    //   );
    // }
    const combinedDateTimeString = `${nextRoundDate}T${nextRoundTime}:00`;
    console.log("Combined Date-Time String:");
    console.log(combinedDateTimeString);
    const date = new Date(combinedDateTimeString);
    console.log("Parsed Date:");
    console.log(date);
    if (isNaN(date.getTime())) {
        return next(new app_error_1.default(`Invalid combined date and time`, 400));
    }
    equb = yield db_config_1.default.equb.update({
        where: {
            id: req.params.id,
        },
        data: {
            nextRoundDate: date,
            nextRoundTime: nextRoundTime,
            currentRoundWinners: Number(currentRoundWinners),
            nextRoundLotteryType: nextRoundLotteryType,
        },
        include: {
            equbers: {
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
        },
    });
    const now = new Date();
    // const aMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const aMinuteAgoInEth = (0, date_helper_1.getDateInNairobiTimezone)(now);
    console.log(`aMinuteAgoInEth`, aMinuteAgoInEth);
    console.log(`equb.nextRoundDate`, equb.nextRoundDate);
    const time1 = (0, dayjs_1.default)(now); // 2:30 PM
    const time2 = (0, dayjs_1.default)(equb.nextRoundDate); // 9:15 AM
    // Difference in hours
    const differenceInHours = time2.diff(time1, "hour");
    console.log(`Difference in hours: ${differenceInHours}`);
    // Difference in minutes
    const differenceInMinutes = time2.diff(time1, "minute");
    console.log(`Difference in minutes: ${differenceInMinutes}`);
    if (differenceInMinutes <= 1) {
        return next(new app_error_1.default(`You can't set lottery date a minute before Lottery Draw date.`, 400));
    }
    if (notifyAllMembers) {
        try {
            // Fetch Equb details with associated members
            const equbNotified = yield db_config_1.default.equb.findUnique({
                where: {
                    id: req.params.id,
                },
                include: {
                    equbers: {
                        include: {
                            users: {
                                include: {
                                    user: {
                                        include: {
                                            deviceTokens: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    equbType: true,
                    equbCategory: true,
                },
            });
            if (!equbNotified) {
                console.error("Equb not found.");
                return;
            }
            // Validate and construct next round date and time
            if (!nextRoundDate || !nextRoundTime) {
                console.error("Missing nextRoundDate or nextRoundTime.");
                return;
            }
            // const nextRoundDateTime = new Date(
            //   `${nextRoundDate}T${nextRoundTime}:00`
            // );
            // Skip notifications if the target time is in the past
            if (differenceInMinutes <= 0) {
                console.log("The next round date and time is in the past. No notification sent.");
                return;
            }
            // Extract device tokens and member details
            const members = equbNotified.equbers.flatMap((equber) => equber.users.map((user) => {
                var _a;
                return ({
                    token: (_a = user.user.deviceTokens) === null || _a === void 0 ? void 0 : _a.map((token) => token.token),
                    fullName: user.user.fullName,
                    id: user.user.id,
                });
            }));
            // Destructure Equb details for notifications
            const { name: equbName, id: equbId, serviceCharge: equbServiceCharge, equbAmount, numberOfEqubers, equbCategory, } = equbNotified;
            const equbRequest = equbCategory.needsRequest;
            const equberLength = equbNotified.equbers.length;
            // Send notifications if within 10 minutes
            // if (differenceInMinute <= 10) {
            const message = `The ${equbName} Equb draw is drawn in ${nextRoundDate} at ${nextRoundTime}. Please be prepared!`;
            console.log("nextRoundDate", nextRoundDate);
            const sendNextRound = new Date(equbNotified === null || equbNotified === void 0 ? void 0 : equbNotified.nextRoundDate);
            const isoString = date.toISOString();
            console.log("equbNotified?.nextRoundDate!", isoString);
            yield Promise.all(members.map((member) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    if (member.token && member.token.length > 0) {
                        // Send push notification
                        yield notification_service_1.PushNotification.getInstance().sendNotification(`Hello ${member.fullName}`, message, member.token, {
                            type: "Equb Draw",
                            equbName: equbName.toString(),
                            equbId: equbId.toString(),
                            equbServiceCharge: equbServiceCharge.toString(),
                            equbAmount: equbAmount.toString(),
                            nextRoundTime: nextRoundTime.toString(),
                            nextRoundDate: isoString,
                            nextRoundLotteryType: nextRoundLotteryType.toString(),
                            numberOfEqubers: numberOfEqubers.toString(),
                            equbRequest: equbRequest.toString(),
                            equberLength: equberLength.toString(),
                        });
                        // Save notification to the database
                        yield db_config_1.default.notification.create({
                            data: {
                                title: "Hagerigna Equb",
                                body: message,
                                userId: `${member.id}`,
                            },
                        });
                    }
                }
                catch (error) {
                    console.error(`Failed to send notification to ${member.fullName}:`, error);
                }
            })));
            console.log(`Equb draw notifications sent to: ${members
                .map((member) => member.fullName)
                .join(", ")}`);
            // }
        }
        catch (error) {
            console.error("Error in processing notifications:", error);
        }
    }
    // Define the two dates as ISO strings
    const equbNextRoundDate = new Date(equb.nextRoundDate);
    const currentDateInNairobi = new Date((0, date_helper_1.getDateInNairobiTimezone)(new Date()));
    // Ensure the dates are properly typed and converted to numbers (milliseconds since epoch)
    const differenceInMilliseconds = equbNextRoundDate.getTime() - currentDateInNairobi.getTime();
    // Convert the difference to seconds
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(differenceInSeconds / (3600 * 24));
    const hours = Math.floor((differenceInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((differenceInSeconds % 3600) / 60);
    const seconds = differenceInSeconds % 60;
    // Log the human-readable difference
    console.log(`Time difference: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
    // Add the difference to a reference date (e.g., Epoch or a specific date)
    const referenceDate = new Date("1970-01-01T00:00:00.000Z"); // Base date (can be adjusted)
    const newDate = new Date(referenceDate.getTime() + differenceInMilliseconds);
    // Format the result as an ISO string
    const formattedDifferenceDate = newDate.toISOString();
    // Log the ISO-like formatted difference date
    console.log(`Difference as ISO-like date: ${formattedDifferenceDate}`);
    // Log the result
    // console.log(`Time difference: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
    web_socket_service_1.WebSocketService.getInstance().publish(event_name_enum_1.EventNames.EQUB_LOTTERY, {
        nextRoundDate: equb.nextRoundDate,
        date: (0, date_helper_1.getDateInNairobiTimezone)(new Date()),
        equbId: equb.id,
        RemainingDate: formattedDifferenceDate,
        remainingDays: days,
        remainingHours: hours,
        remainingMinutes: minutes,
        remainingSeconds: seconds,
    });
    res.status(200).json({
        status: "success",
        data: {
            equb,
        },
    });
}));
exports.getLottery = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = yield db_config_1.default.equb.findUnique({
        where: {
            id: req.params.id,
        },
        include: {
            equbers: {
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
        },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    const eligibleEqubers = (0, get_eligible_equbers_helper_1.getEligibleEqubers)(equb.equbers, equb.currentRound, equb.equbAmount);
    res.status(200).json({
        status: "success",
        data: {
            equb,
        },
    });
}));
exports.markEqubberAsPaid = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const { reference } = req.body;
    let equberUser = yield db_config_1.default.equberUser.findUnique({
        where: {
            id: req.params.id,
        },
        include: {
            equber: true,
            user: {
                include: {
                    deviceTokens: true,
                },
            },
        },
    });
    if (!equberUser) {
        return next(new app_error_1.default(`This equber user does not exist`, 400));
    }
    console.log("mark as paid userid", equberUser);
    const equb = (yield db_config_1.default.equb.findUnique({
        where: { id: (_g = (_f = equberUser === null || equberUser === void 0 ? void 0 : equberUser.equber) === null || _f === void 0 ? void 0 : _f.equbId) !== null && _g !== void 0 ? _g : "" },
    }));
    const totalContribution = equb.equbAmount * equb.numberOfEqubers;
    const totalServiceCharge = totalContribution * (equb.serviceCharge / 100);
    let calculatedAmount;
    if ((_h = equberUser === null || equberUser === void 0 ? void 0 : equberUser.equber) === null || _h === void 0 ? void 0 : _h.isGruop) {
        // For grouped equbers, calculate based on user's stake
        const userStake = equberUser.stake || 100;
        const userStakePercentage = userStake / 100;
        const userShare = totalContribution * userStakePercentage;
        const userServiceCharge = totalServiceCharge * userStakePercentage;
        calculatedAmount = userShare - userServiceCharge;
    }
    else {
        // For individual users
        calculatedAmount = totalContribution - totalServiceCharge;
    }
    equberUser = (yield db_config_1.default.equberUser.update({
        where: { id: equberUser.id },
        include: { equber: true },
        data: {
            hasTakenEqub: true,
            calculatedPaidAmount: calculatedAmount,
        },
    }));
    console.log("calculatedAmount", calculatedAmount);
    console.log("equb.numberOfEqubers", equb.numberOfEqubers);
    console.log("equberUser.stake ", (_j = equberUser === null || equberUser === void 0 ? void 0 : equberUser.stake) !== null && _j !== void 0 ? _j : 100);
    console.log("equb.serviceCharge", equb.serviceCharge);
    console.log("equb.equbAmount", equb.equbAmount);
    const payment = yield db_config_1.default.payment.create({
        data: {
            type: "lottery",
            equberUserId: (_k = equberUser === null || equberUser === void 0 ? void 0 : equberUser.id) !== null && _k !== void 0 ? _k : "",
            amount: calculatedAmount,
            equbId: equb.id,
            paymentMethod: "bankTransfer",
            round: (_m = (_l = equberUser === null || equberUser === void 0 ? void 0 : equberUser.equber) === null || _l === void 0 ? void 0 : _l.winRound) !== null && _m !== void 0 ? _m : "",
            userId: (_o = equberUser === null || equberUser === void 0 ? void 0 : equberUser.userId) !== null && _o !== void 0 ? _o : "",
            reference: reference,
            approved: true,
        },
    });
    // Send push notification
    const message = `Your payment of ${calculatedAmount} has been marked as paid.`;
    const tokens = (_p = equberUser === null || equberUser === void 0 ? void 0 : equberUser.user.deviceTokens) === null || _p === void 0 ? void 0 : _p.map((token) => token.token);
    if (tokens && tokens.length > 0) {
        yield notification_service_1.PushNotification.getInstance().sendNotification(`Hello ${equberUser === null || equberUser === void 0 ? void 0 : equberUser.user.fullName}`, message, tokens, {
            type: "Payment",
            amount: calculatedAmount.toString(),
            reference: reference,
        });
        // Save notification to the database
        yield db_config_1.default.notification.create({
            data: {
                title: "Payment Confirmation",
                body: message,
                userId: `${equberUser === null || equberUser === void 0 ? void 0 : equberUser.userId}`,
            },
        });
    }
    res.status(200).json({
        status: "success",
        data: {
            hasTakenEqub: true,
            payment,
        },
    });
}));
exports.getLotteryRequests = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const equb = yield db_config_1.default.equb.findUnique({ where: { id: req.params.id } });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    const filter = {
        equber: {
            equbId: req.params.id,
        },
    };
    if (query._search) {
        filter.equber = Object.assign(Object.assign({}, filter.equber), { users: {
                some: {
                    user: {
                        fullName: {
                            contains: query._search,
                            mode: "insensitive",
                        },
                    },
                },
            } });
    }
    const orderBy = query.sortBy === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };
    const [requests, total] = yield Promise.all([
        yield db_config_1.default.lotteryRequest.findMany({
            where: filter,
            take: limit,
            skip,
            include: {
                equber: {
                    include: {
                        users: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
            orderBy,
        }),
        yield db_config_1.default.lotteryRequest.count({
            where: filter,
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            requests,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getEqubStats = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equbs = yield db_config_1.default.equb.findMany();
    const users = yield db_config_1.default.user.findMany();
    console.log("Equbs Stats", equbs);
    if (!equbs) {
        return next(new app_error_1.default(`Equb  does not exist`, 400));
    }
    if (!users) {
        return next(new app_error_1.default(`Users  does not exist`, 400));
    }
    let registeringCount = 0;
    let activeCount = 0;
    let closedCount = 0;
    let totalEqubers = users.length;
    // Count the number of equbs based on their status
    equbs.forEach((equb) => {
        if (equb.status === "registering") {
            registeringCount++;
        }
        else if (equb.status === "started") {
            activeCount++; // 'started' becomes 'active'
        }
        else if (equb.status === "completed") {
            closedCount++;
        }
    });
    // Calculate the total number of equbs
    const totalEqubs = registeringCount + activeCount + closedCount;
    // Calculate percentages
    const registeringPercentage = (registeringCount / totalEqubs) * 100;
    const activePercentage = (activeCount / totalEqubs) * 100;
    const closedPercentage = (closedCount / totalEqubs) * 100;
    // Send response with counts and percentages
    res.status(200).json({
        totalEqubers,
        totalEqubs,
        registeringCount,
        activeCount,
        closedCount,
        percentages: {
            registering: Number(registeringPercentage.toFixed(0)),
            active: Number(activePercentage.toFixed(0)),
            closed: Number(closedPercentage.toFixed(0)),
        },
    });
}));
exports.getEqubWinners = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = (page - 1) * limit;
    // Find the Equb
    const equb = yield db_config_1.default.equb.findUnique({
        where: { id: req.params.id },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    const filter = {
        equbId: req.params.id,
    };
    if (query._search) {
        filter.users = {
            some: {
                user: {
                    fullName: {
                        contains: query._search,
                        mode: "insensitive",
                    },
                },
            },
        };
    }
    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
        filter.createdAt = {
            gte: startDate,
            lte: endDate,
        };
    }
    // Add date filtering to the where clause if LOTTERY_NUMBER
    if (query.lotteryNumber) {
        filter.lotteryNumber = {
            equals: query.lotteryNumber,
        };
    }
    const orderBy = query.sortBy === "oldest"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };
    // Fetch equbers and count
    const [equbers, total] = yield Promise.all([
        db_config_1.default.equber.findMany({
            where: filter,
            take: limit,
            skip,
            include: {
                users: {
                    include: {
                        user: true,
                        payments: true,
                    },
                },
            },
            orderBy,
        }),
        db_config_1.default.equber.count({
            where: filter,
        }),
    ]);
    // Calculate the paid amount for each winner
    const winnersData = yield Promise.all(equbers.map((equber) => __awaiter(void 0, void 0, void 0, function* () {
        var _q;
        const totalContribution = equb.equbAmount * equb.numberOfEqubers;
        const totalServiceCharge = totalContribution * (equb.serviceCharge / 100);
        if (equber.isGruop && equber.users) {
            // For grouped equbers, calculate amount for each user based on their stake
            const usersWithCalculatedAmount = yield Promise.all(equber.users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
                const userStake = user.stake || 100;
                const userStakePercentage = userStake / 100;
                const userShare = totalContribution * userStakePercentage;
                const userServiceCharge = totalServiceCharge * userStakePercentage;
                const userCalculatedAmount = userShare - userServiceCharge;
                // Update calculatedPaidAmount in the database
                yield db_config_1.default.equberUser.update({
                    where: { id: user.id },
                    data: { calculatedPaidAmount: userCalculatedAmount },
                });
                return Object.assign(Object.assign({}, user), { calculatedPaidAmount: userCalculatedAmount });
            })));
            const calculatedPaidAmount = usersWithCalculatedAmount.reduce((total, user) => total + user.calculatedPaidAmount, 0);
            return Object.assign(Object.assign({}, equber), { users: usersWithCalculatedAmount, calculatedPaidAmount, isGrouped: true, totalStake: usersWithCalculatedAmount.reduce((total, user) => total + (user.stake || 0), 0) });
        }
        else {
            // For individual users
            const calculatedPaidAmount = totalContribution - totalServiceCharge;
            const userWithCalculatedAmount = ((_q = equber.users) === null || _q === void 0 ? void 0 : _q[0])
                ? Object.assign(Object.assign({}, equber.users[0]), { calculatedPaidAmount }) : null;
            // Update calculatedPaidAmount in the database
            if (userWithCalculatedAmount) {
                yield db_config_1.default.equberUser.update({
                    where: { id: userWithCalculatedAmount.id },
                    data: { calculatedPaidAmount },
                });
            }
            return Object.assign(Object.assign({}, equber), { users: userWithCalculatedAmount ? [userWithCalculatedAmount] : [], calculatedPaidAmount, isGrouped: false, totalStake: (userWithCalculatedAmount === null || userWithCalculatedAmount === void 0 ? void 0 : userWithCalculatedAmount.stake) || 0 });
        }
    })));
    // Response
    res.status(200).json({
        status: "success",
        data: {
            Winners: winnersData,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.ChartData = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equberHistory = yield db_config_1.default.equberPaymentHistory.findMany({
        where: {
            equberId: req.params.id,
        },
    });
    res.status(200).json(equberHistory);
}));
exports.getNotifications = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const getNotifications = yield db_config_1.default.notification.findMany();
    res.status(200).json(getNotifications);
}));
exports.deleteNotifications = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedNotification = yield db_config_1.default.notification.delete({
        where: { id: req.params.id },
    });
    res.status(200).json({
        status: "success",
        message: "Notification deleted successfully",
        data: deletedNotification,
    });
}));
exports.getFinanceAndOther = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield db_config_1.default.user.findMany({
        include: {
            joinedEqubs: {
                include: {
                    equbCategory: true,
                },
            },
        },
    });
    console.log("users", users[0].joinedEqubs);
    const financeAndCar = users.filter((user) => user.joinedEqubs.some((equb) => equb.equbCategory.name === "Finance") &&
        user.joinedEqubs.some((equb) => equb.equbCategory.name === "Car"));
    const financeAndHouse = users.filter((user) => user.joinedEqubs.some((equb) => equb.equbCategory.name === "Finance") &&
        user.joinedEqubs.some((equb) => equb.equbCategory.name === "House"));
    const financeAndTravel = users.filter((user) => user.joinedEqubs.some((equb) => equb.equbCategory.name === "Finance") &&
        user.joinedEqubs.some((equb) => equb.equbCategory.name === "Travel"));
    const specialFinance = users.filter((user) => user.joinedEqubs.some((equb) => equb.equbCategory.name === "Special Finance"));
    res.status(200).json({
        financeAndCar,
        financeAndHouse,
        financeAndTravel,
        specialFinance,
    });
}));
exports.getFinanceAndOtherMobile = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { equbTypeId, equbCategoryId } = req.query;
    const users = yield db_config_1.default.user.findMany({
        where: {
            id: req.params.id,
        },
        include: {
            joinedEqubs: {
                include: {
                    equbCategory: true,
                    equbType: true,
                    equbers: true,
                },
            },
        },
    });
    if (!users || users.length === 0) {
        return next(new app_error_1.default(`No user found with ID ${req.params.id}`, 404));
    }
    if (!users[0].joinedEqubs) {
        return next(new app_error_1.default(`User with ID ${req.params.id} has no joined equbs`, 404));
    }
    const groupByCategory = (categoryName1, categoryName2) => {
        return users.filter((user) => {
            const hasCategory1 = user.joinedEqubs.some((equb) => {
                // console.log(`equb.equbCategory.name: ${equb.equbCategory.name}`);
                return equb.equbCategory.name === categoryName1;
            });
            const hasCategory2 = categoryName2
                ? user.joinedEqubs.some((equb) => {
                    // console.log(`equb.equbCategory.name: ${equb.equbCategory.name}`);
                    return equb.equbCategory.name === categoryName2;
                })
                : true;
            // console.log(
            //   `User ${user.id} hasCategory1: ${hasCategory1}, hasCategory2: ${hasCategory2}`
            // );
            return hasCategory1 && hasCategory2;
        });
    };
    const filterEqubs = (users) => {
        return users
            .map((user) => {
            const filteredEqubs = user.joinedEqubs.filter((equb) => {
                const categoryMatch = equbCategoryId
                    ? equb.equbCategory.id === equbCategoryId
                    : true;
                const typeMatch = equbTypeId
                    ? equb.equbType.id === equbTypeId
                    : true;
                return categoryMatch && typeMatch;
            });
            // Only return users with at least one matching joinedEqub
            return Object.assign(Object.assign({}, user), { joinedEqubs: filteredEqubs });
        })
            .filter((user) => user.joinedEqubs.length > 0);
    };
    const addEquberCount = (users) => {
        return users.map((user) => {
            const joinedEqubsWithCount = user.joinedEqubs.map((equb) => {
                return Object.assign(Object.assign({}, equb), { equberCount: equb.equbers.length, equbers: undefined });
            });
            return Object.assign(Object.assign({}, user), { joinedEqubs: joinedEqubsWithCount });
        });
    };
    const financeAndCar = addEquberCount(filterEqubs(groupByCategory("Finance", "Car")));
    const financeAndHouse = addEquberCount(filterEqubs(groupByCategory("Finance", "House")));
    const financeAndTravel = addEquberCount(filterEqubs(groupByCategory("Finance", "Travel")));
    const specialFinance = addEquberCount(filterEqubs(groupByCategory("Special Finance")));
    // console.log("financeAndCar", financeAndCar.length);
    // console.log("financeAndHouse", financeAndHouse.length);
    // console.log("financeAndTravel", financeAndTravel.length);
    // console.log("specialFinance", specialFinance.length);
    res.status(200).json({
        status: "success",
        data: {
            financeAndCar,
            financeAndHouse,
            financeAndTravel,
            specialFinance,
        },
    });
}));
exports.closeEqub = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = yield db_config_1.default.equb.update({
        where: {
            id: req.params.id,
        },
        data: {
            status: "completed",
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            equb,
        },
    });
}));
exports.deleteEqub = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equbId = req.params.id;
    // Delete related records in the Payment table
    yield db_config_1.default.payment.deleteMany({
        where: {
            equbId: equbId,
        },
    });
    // Delete related records in the Payment table
    yield db_config_1.default.payment.deleteMany({
        where: {
            equbId: equbId,
        },
    });
    // Delete the Equb record
    const equb = yield db_config_1.default.equb.delete({
        where: {
            id: equbId,
        },
    });
    res.status(200).json({
        status: "success",
        // data: {
        //   equb,
        // },
    });
}));
exports.userPayment = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = (yield db_config_1.default.equb.findUnique({
        where: {
            id: req.params.id,
        },
        include: {
            equbers: {
                include: {
                    users: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                        },
                    },
                    payments: {
                        include: { user: true },
                    },
                    lotteryRequest: true,
                },
            },
        },
    }));
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    console.log("reached here");
    console.log("payments", equb);
    const allPayments = equb.equbers.flatMap((equber) => equber.payments);
    // return res.json({equbers:equb.equbers})
    res.status(200).json({
        status: "success",
        data: {
            equbRound: equb.currentRound,
            equbersPaid: (0, payment_helper_1.equbersPaid)(equb),
            equbers: equb.equbers.length,
            payments: (0, payment_helper_1.structuredUserPayment)(equb),
        },
    });
}));
exports.getEqubClaimer = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const filter = {
        hasClaimed: true,
        hasTakenEqub: false,
    };
    if (query._search) {
        filter.user = {
            fullName: {
                contains: query._search,
                mode: "insensitive",
            },
        };
    }
    if (query.equb) {
        filter.equber = {
            equbId: query.equb,
        };
    }
    if (startDate && endDate) {
        filter.createdAt = {
            gte: startDate,
            lte: endDate,
        };
    }
    const equbers = yield db_config_1.default.equberUser.findMany({
        where: filter,
        include: {
            equber: {
                select: {
                    equb: {
                        select: {
                            id: true,
                        },
                    },
                },
            },
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
    });
    if (!equbers) {
        return next(new app_error_1.default(`No equbers found with hasClaimed true `, 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            equbers,
        },
    });
}));
exports.getPaymentHistory = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    let filter = {};
    // Search by user full name (nested under equberUser.user)
    if (query._search) {
        const terms = query._search.split(" ").filter(Boolean); // Split by space and remove empty strings
        filter.equberUser = {
            user: {
                AND: terms.map(term => ({
                    fullName: {
                        contains: term,
                        mode: "insensitive",
                    },
                })),
            },
        };
    }
    // Filter by createdAt (directly on equberUserPayment)
    if (startDate && endDate) {
        filter.createdAt = {
            gte: startDate,
            lte: endDate,
        };
    }
    // Filter by equbId (nested under payment.equb)
    if (query.equb) {
        filter.payment = {
            equb: {
                id: query.equb,
            },
        };
    }
    const paymentHistory = yield db_config_1.default.equberUserPayment.findMany({
        where: Object.assign(Object.assign({}, filter), { equberUser: Object.assign(Object.assign({}, filter === null || filter === void 0 ? void 0 : filter.equberUser), { equber: {
                    isNot: null,
                } }) }),
        select: {
            id: true,
            amount: true,
            payment: {
                select: {
                    type: true,
                    paymentMethod: true,
                    equb: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            equberUser: {
                select: {
                    id: true,
                    paymentScoreCalculatedRound: true,
                    equber: {
                        select: {
                            lotteryNumber: true,
                        },
                    },
                    stake: true,
                    calculatedPaidAmount: true,
                    user: {
                        select: {
                            fullName: true,
                            phoneNumber: true,
                        },
                    },
                },
            },
            createdAt: true,
        },
    });
    //       // Fetching payments where type is "lottery"
    // paymentHistory.forEach(element => {
    //   if(element.equberUser?.calculatedPaidAmount) {
    //     const payment=  prisma.equberUser.findFirst({
    //       where: {
    //         id: element.equberUser.id,
    //       },
    //   })
    //    }
    // });
    // Calculate total amounts for both payments
    const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    const totalReceived = paymentHistory
        .reduce((sum, payment) => { var _a; return sum + (((_a = payment.equberUser) === null || _a === void 0 ? void 0 : _a.calculatedPaidAmount) || 0); }, 0);
    //  Log full nested structure
    console.dir(paymentHistory, { depth: null });
    // Respond with the data
    res.status(200).json({
        status: "success",
        data: {
            paymentHistory,
            totalPaid,
            totalReceived,
        },
    });
}));
