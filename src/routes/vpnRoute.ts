import express from "express";
import {
  downloadConfigFile,
  getVpn, scrapeVPNData, scrapeVpnBook, downloadVpnBookConfig, getVpnGateCached
} from "../controllers/vpnController";

const router = express.Router();


router.route("/").get(getVpn);
router.route("/vpngate").get(getVpnGateCached);
router.route("/sc").get(scrapeVPNData);
router.route("/vpnbook").get(scrapeVpnBook);
router.route("/vpnbook/config").get(downloadVpnBookConfig);
router.route("/config").post(downloadConfigFile);

module.exports = router;
