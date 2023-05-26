"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
process.on("uncaughtException", (err) => {
    console.log("Error : ", err.message);
    console.log("Shutting down the server due to Uncaught Exception");
    process.exit(1);
});
// config
dotenv_1.default.config({ path: "./.env" });
// ConnectDatabase();
const PORT = process.env.DEV ? process.env.PORT_DEV : process.env.PORT_PRO;
const server = app_1.default.listen(PORT, () => {
    console.log("server is working on http://localhost:", PORT);
});
// UnHandled Promise Rejection
process.on("unhandledRejection", (err) => {
    console.log("Error : ", err.message);
    console.log("Shutting down the server due to Unhandled Promise Rejection");
    server.close(() => {
        process.exit(1);
    });
});
//# sourceMappingURL=server.js.map