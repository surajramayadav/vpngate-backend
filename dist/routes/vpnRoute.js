"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vpnController_1 = require("../controllers/vpnController");
const router = express_1.default.Router();
router.route("/").get(vpnController_1.getVpn);
router.route("/sc").get(vpnController_1.scrapeVPNData);
router.route("/config").post(vpnController_1.downloadConfigFile);
module.exports = router;
//# sourceMappingURL=vpnRoute.js.map