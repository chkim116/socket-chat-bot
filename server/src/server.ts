import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import answers from "./lib/answers.json";

const httpServer: http.Server = http.createServer(express());
const socket: Server = new Server(httpServer, {
    cors: { origin: "*" },
});

class App {
    run() {
        httpServer.listen(8080, () =>
            console.log("http://localhost:8080 is running")
        );
    }
}

class Main extends App {
    io: Socket | null = null;

    connect() {
        this.io?.emit("connected", true);
    }

    disconnect() {
        this.io?.on("disconnect", () => {
            console.log("disconnect socket");
        });
    }

    logger() {
        this.io?.onAny((ev, ...args) => console.log(ev, args));
    }

    sendGuide() {
        this.io?.emit("welcome", {
            type: 1,
            message: "'-help'로 명령어를 확인해 보세요.",
        });
    }

    sendAnswer() {
        this.io?.on(
            "bot",
            (
                value: string,
                fn: (msg: { type: 0 | 1; message: string }) => void
            ) => {
                const index = answers.findIndex(
                    ({ question }) => question === value.toLowerCase()
                );
                fn({
                    type: 1,
                    message:
                        index > -1
                            ? answers[index].answer
                            : "올바르지 않은 키워드입니다.",
                });
            }
        );
    }

    connection() {
        socket.on("connection", (io) => {
            this.io = io;
            if (!this.io) throw new Error("can not find socket io");
            console.log("connect on server");
            this.logger();
            this.connect();
            this.disconnect();

            this.sendGuide();
            this.sendAnswer();
        });
    }
}

const server = new Main();

server.run();
server.connection();
