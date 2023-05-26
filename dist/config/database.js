"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ConnectDatabase = () => {
    // const DB = process.env.DB_URI_DEV 
    const DB = process.env.DB_URI_DEV;
    mongoose_1.default.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
        .then((data) => {
        console.log("Mongodb connected with server : ", data.connection.host);
    });
};
exports.default = ConnectDatabase;
//# sourceMappingURL=database.js.map