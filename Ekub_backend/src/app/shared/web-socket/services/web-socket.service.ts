import http from "http";
import { Server } from "socket.io";
import { EventNames } from "../enums/event-name.enum";
import { fetchEqubLotteryData } from "../../../utils/fetchEqubLotteryData";

export class WebSocketService {
  private server: Server;
  private static instance: WebSocketService;
  private constructor(httpServer?: http.Server) {
    this.server = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });
    this.subscribe();
  }
  

  public static getInstance(httpServer?: http.Server): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(httpServer);
    }
    return WebSocketService.instance;
  }

  public publish(event: EventNames, data: any, room?: string) {
    if (room) {
      this.server.to(room).emit(event, data);
    } else {
      this.server.emit(event, data);
    }
  }


  private subscribe() {
    this.server.on("connection", async (socket) => {
      const id = socket.handshake.query.id as unknown as string;
      socket.emit(EventNames.SOCKET_CONNECTED, id);
      console.log("connected");
      
      socket.on(EventNames.JOIN_ROOM, (room: string) => {
        socket.join(room);
      });
      socket.on(EventNames.LEAVE_ROOM, (room: string) => {
        socket.leave(room);
      });

      let hasEmittedForFirstUser = false; 

      socket.on("message", async (equbId: string) => {
        try {
          if (!hasEmittedForFirstUser) {
            hasEmittedForFirstUser = true;
            const data = await fetchEqubLotteryData(equbId);
            socket.emit(EventNames.EQUB_ElIGIBLE, {
              // Emit for the first user only
              status: "success",
              data,
            });
            console.log("Event emitted for the first user.");
          } else {
            console.log(
              "Event already emitted for the first user. Skipping..."
            );
          }
        } catch (error: any) {
          console.error("Error fetching equb data:", error);
          socket.emit(EventNames.EQUB_ElIGIBLE, {
            status: "error",
            message: error.message,
          });
        }
      });
     
      socket.on("disconnect", () => {
      console.log("disconnected");
      });
    });
  }

}
