"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const error_1 = __importDefault(require("./middleware/error"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const vpn = require("./routes/vpnRoute");
const corsOptions = {
    // origin: "http://localhost:8081",
    origin: "*",
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, express_fileupload_1.default)({ useTempFiles: false }));
app.use(express_1.default.static((path_1.default.join(__dirname, "../public/images/"))));
app.use("/api/v1/vpn", vpn);
// app.get("/logo", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/images/logo.jpg"));
// });
app.get("/", (req, res) => {
    res.send('Working...');
});
// Middleware For error
app.use(error_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map