
import express from "express";
import {
  downloadConfigFile,
  getVpn, scrapeVPNData
} from "../controllers/vpnController";

const router = express.Router();


router.route("/").get(getVpn);
router.route("/sc").get(scrapeVPNData);
router.route("/config").post(downloadConfigFile);

module.exports = router;
