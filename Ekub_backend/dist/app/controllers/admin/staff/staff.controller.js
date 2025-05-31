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
exports.deleteStaff = exports.updateStaff = exports.createStaff = exports.getStaff = exports.getExportStaffs = exports.getStaffs = exports.uploadImage = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const hashedText_1 = require("../../../utils/hashedText");
const multer_config_1 = require("../../../config/multer.config");
const mail_service_1 = __importDefault(require("../../../shared/mail/services/mail.service"));
const client_1 = require("@prisma/client");
const upload = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.AVATAR, multer_config_1.DESTINANTIONS.IMAGE.AVATAR, multer_config_1.FILTERS.IMAGE);
/**
 * Upload Middleware
 */
exports.uploadImage = {
    pre: upload.single("avatar"),
    post: (req, _, next) => {
        if (req.file) {
            req.body.avatar = req.file.filename;
        }
        next();
    },
};
exports.getStaffs = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    // Add search functionality
    if (query._search) {
        filter.OR = [
            {
                firstName: {
                    contains: query._search,
                    mode: "insensitive", // Case-insensitive search
                },
            },
            {
                lastName: {
                    contains: query._search,
                    mode: "insensitive", // Case-insensitive search
                },
            },
            {
                email: {
                    contains: query._search,
                    mode: "insensitive", // Case-insensitive search
                },
            },
        ];
    }
    const [staffs, total] = yield Promise.all([
        db_config_1.default.staff.findMany({
            where: filter,
            include: {
                role: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
            take: limit,
            skip,
        }),
        db_config_1.default.staff.count({
            where: filter,
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            staffs,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getExportStaffs = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const filter = {};
    // Add search functionality
    if (query._search) {
        filter.OR = [
            {
                firstName: {
                    contains: query._search,
                    mode: "insensitive", // Case-insensitive search
                },
            },
            {
                lastName: {
                    contains: query._search,
                    mode: "insensitive", // Case-insensitive search
                },
            },
            {
                email: {
                    contains: query._search,
                    mode: "insensitive", // Case-insensitive search
                },
            },
        ];
    }
    const [staffs, total] = yield Promise.all([
        db_config_1.default.staff.findMany({
            where: filter,
            include: {
                role: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
        }),
        db_config_1.default.staff.count({
            where: filter,
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            staffs,
            meta: {
                total,
            },
        },
    });
}));
exports.getStaff = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const staff = yield db_config_1.default.staff.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!staff) {
        return next(new app_error_1.default(`Staff with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            staff,
        },
    });
}));
exports.createStaff = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log(" req.file on controller");
    console.log(req.file);
    const { firstName, lastName, email, phoneNumber, roleId, fileName, branchId, password, } = req.body;
    console.log(`avatar: ${fileName}`);
    // const password = uuidv4().split("-")[0];
    const role = yield db_config_1.default.role.findUnique({ where: { id: roleId } });
    if (!role) {
        return next(new app_error_1.default(`Role with ID ${req.params.id} does not exist`, 400));
    }
    if (branchId) {
        const branch = yield db_config_1.default.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            return next(new app_error_1.default(`Branch with ID ${req.params.id} does not exist`, 400));
        }
    }
    const hashedPassword = yield (0, hashedText_1.hashedString)(password);
    const mainBranch = yield db_config_1.default.branch.findFirst({
        where: { isMain: true },
    });
    console.log(`firstName: ${firstName}, lastName: ${lastName}, email: ${email}, phoneNumber: ${phoneNumber}, roleId: ${roleId}, fileName: ${fileName}`);
    const staff = yield db_config_1.default.staff.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            fullName: `${firstName} ${lastName}`,
            email: email,
            phoneNumber: phoneNumber,
            password: hashedPassword,
            roleId: roleId,
            isActive: true,
            avatar: fileName ? fileName : "",
            branchId: branchId ? branchId : (mainBranch === null || mainBranch === void 0 ? void 0 : mainBranch.id) || "",
        },
        include: {
            role: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    mail_service_1.default.sendStaffWelcome(staff.email, staff.fullName, password);
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.staff,
            staffId: (_a = req.staff) === null || _a === void 0 ? void 0 : _a.id,
            doneToStaffId: staff.id,
            description: `${(_b = req.staff) === null || _b === void 0 ? void 0 : _b.fullName} added ${role.name} - ${staff.fullName}.`,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            staff,
        },
    });
}));
exports.updateStaff = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { firstName, lastName, email, phoneNumber, password, roleId, fileName, state } = req.body;
    const role = yield db_config_1.default.role.findUnique({ where: { id: roleId } });
    if (!role) {
        return next(new app_error_1.default(`Role with ID ${req.params.id} does not exist`, 400));
    }
    let updatedData = {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        phoneNumber,
        roleId,
        state,
    };
    if (password)
        updatedData.password = yield (0, hashedText_1.hashedString)(password);
    if (fileName)
        updatedData.avatar = fileName;
    const staff = yield db_config_1.default.staff.update({
        where: { id: req.params.id },
        data: updatedData,
        include: {
            role: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    if (!staff) {
        return next(new app_error_1.default(`Staff with ID ${req.params.id} does not exist`, 400));
    }
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.staff,
            staffId: (_c = req.staff) === null || _c === void 0 ? void 0 : _c.id,
            doneToStaffId: staff.id,
            description: `${(_d = req.staff) === null || _d === void 0 ? void 0 : _d.fullName} updated ${role.name} - ${staff.fullName}.`,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            staff,
        },
    });
}));
exports.deleteStaff = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sraffId = req.params.id;
    // Delete related records in the Payment table
    // await prisma.payment.deleteMany({
    //   where: {
    //     equbId: equbId,
    //   },
    // });
    // Delete the Equb record
    const equb = yield db_config_1.default.staff.delete({
        where: {
            id: sraffId,
        },
    });
    res.status(200).json({
        status: "success",
        // data: {
        //   equb,
        // },
    });
}));
