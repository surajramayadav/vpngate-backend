"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VpnServerModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const vpnServerSchema = new mongoose_1.default.Schema({
    country: { type: String, required: true },
    flag: { type: String, default: '' },
    ip: { type: String, required: true },
    speed: { type: String, required: true },
    link: { type: String, required: true },
    bool: { type: Boolean, default: true },
    countryShort: { type: String, required: true },
    ipClean: { type: String, required: true },
    speedMbps: { type: Number, required: true },
    ping: { type: Number, required: true },
    score: { type: Number, required: true },
    hostName: { type: String, required: true },
    // Expiry TTL index: auto-deletes servers after 30 minutes if the cron sync breaks
    createdAt: { type: Date, default: Date.now, expires: 1800 }
});
exports.VpnServerModel = mongoose_1.default.model('VpnServer', vpnServerSchema);
//# sourceMappingURL=VpnServer.js.map