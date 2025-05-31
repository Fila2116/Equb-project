"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const UserAuthMiddleware = __importStar(require("../middlewares/user-auth.middleware"));
const notification_service_1 = require("../shared/notification/services/notification.service");
const web_socket_service_1 = require("../shared/web-socket/services/web-socket.service");
const db_config_1 = __importDefault(require("../config/db.config"));
const event_name_enum_1 = require("../shared/web-socket/enums/event-name.enum");
const router = express_1.default.Router();
router
    .route("/notification")
    .get(UserAuthMiddleware.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield db_config_1.default.user.findUnique({ where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }, include: { deviceTokens: true } });
    if (!user) {
        return res.json({
            msg: "user not found"
        });
    }
    const tokens = user.deviceTokens.map((token) => token.token);
    console.log(tokens);
    // // Firebase server key (replace this with your own server key from Firebase console)
    // const serverKey = 'YOUR_FIREBASE_SERVER_KEY';
    // const message = {
    //     to: deviceToken,
    //     notification: {
    //         title: title,
    //         body: body,
    //     },
    // };
    //@ts-ignore
    notification_service_1.PushNotification.getInstance().sendSingleNotification("Equb", "You have new equb", tokens[tokens.length - 1]);
    res.json({
        msg: `Push notification done`,
    });
}))
    .post((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    res.json({
        body: req.body,
    });
}));
router.route("/socket")
    .get(UserAuthMiddleware.verifyUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const user = yield db_config_1.default.user.findUnique({ where: { id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id }, include: { deviceTokens: true } });
    if (!user) {
        return res.json({
            msg: "user not found"
        });
    }
    web_socket_service_1.WebSocketService.getInstance().publish(event_name_enum_1.EventNames.SOCKET_CONNECTED, { data: "hi" }, event_name_enum_1.EventNames.SOCKET_CONNECTED);
    res.json({
        msg: `Web socket done`,
    });
}));
exports.default = router;
