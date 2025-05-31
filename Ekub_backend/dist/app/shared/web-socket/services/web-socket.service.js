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
exports.WebSocketService = void 0;
const socket_io_1 = require("socket.io");
const event_name_enum_1 = require("../enums/event-name.enum");
const fetchEqubLotteryData_1 = require("../../../utils/fetchEqubLotteryData");
class WebSocketService {
    constructor(httpServer) {
        this.server = new socket_io_1.Server(httpServer, {
            cors: {
                origin: "*",
            },
        });
        this.subscribe();
    }
    static getInstance(httpServer) {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService(httpServer);
        }
        return WebSocketService.instance;
    }
    publish(event, data, room) {
        if (room) {
            this.server.to(room).emit(event, data);
        }
        else {
            this.server.emit(event, data);
        }
    }
    subscribe() {
        this.server.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
            const id = socket.handshake.query.id;
            socket.emit(event_name_enum_1.EventNames.SOCKET_CONNECTED, id);
            console.log("connected");
            socket.on(event_name_enum_1.EventNames.JOIN_ROOM, (room) => {
                socket.join(room);
            });
            socket.on(event_name_enum_1.EventNames.LEAVE_ROOM, (room) => {
                socket.leave(room);
            });
            let hasEmittedForFirstUser = false;
            socket.on("message", (equbId) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!hasEmittedForFirstUser) {
                        hasEmittedForFirstUser = true;
                        const data = yield (0, fetchEqubLotteryData_1.fetchEqubLotteryData)(equbId);
                        socket.emit(event_name_enum_1.EventNames.EQUB_ElIGIBLE, {
                            // Emit for the first user only
                            status: "success",
                            data,
                        });
                        console.log("Event emitted for the first user.");
                    }
                    else {
                        console.log("Event already emitted for the first user. Skipping...");
                    }
                }
                catch (error) {
                    console.error("Error fetching equb data:", error);
                    socket.emit(event_name_enum_1.EventNames.EQUB_ElIGIBLE, {
                        status: "error",
                        message: error.message,
                    });
                }
            }));
            socket.on("disconnect", () => {
                console.log("disconnected");
            });
        }));
    }
}
exports.WebSocketService = WebSocketService;
