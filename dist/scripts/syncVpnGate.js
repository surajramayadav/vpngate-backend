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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const VpnServer_1 = require("../models/VpnServer");
// Load environment variables from .env
dotenv_1.default.config();
const VPNGATE_CSV_URL = 'https://www.vpngate.net/api/iphone/';
// Helper to parse CSV values properly (handling quotes/commas)
function parseCsvRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        }
        else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = '';
        }
        else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}
// Generate country flag emoji dynamically from 2-letter ISO code
function getCountryFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2)
        return '🌐';
    const cc = countryCode.toUpperCase();
    const codePoints = [
        cc.charCodeAt(0) - 65 + 0x1F1E6,
        cc.charCodeAt(1) - 65 + 0x1F1E6
    ];
    try {
        return String.fromCodePoint(...codePoints);
    }
    catch (e) {
        return '🌐';
    }
}
// Parse VPNGate CSV
function parseVpnGateCsv(rawText) {
    const lines = rawText.split(/\r?\n/);
    const servers = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('*') || trimmed.startsWith('#'))
            continue;
        const cols = parseCsvRow(trimmed);
        if (cols.length < 15)
            continue;
        const [hostName, ip, scoreStr, pingStr, speedStr, countryLong, countryShort, , , , , , , , base64Config] = cols;
        if (!base64Config || base64Config.trim().length < 10)
            continue;
        if (!ip || !ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/))
            continue;
        const speedBps = parseInt(speedStr, 10) || 0;
        const speedMbps = parseFloat((speedBps / 1000000).toFixed(2));
        const ping = parseInt(pingStr, 10) || 0;
        const score = parseInt(scoreStr, 10) || 0;
        const cc = countryShort.trim().toUpperCase();
        servers.push({
            country: countryLong.trim() || cc,
            flag: getCountryFlag(cc),
            ip: ip.trim(),
            speed: `${speedMbps.toFixed(1)} Mbps`,
            link: base64Config.trim(),
            bool: true,
            countryShort: cc,
            ipClean: ip.trim(),
            speedMbps,
            ping,
            score,
            hostName: hostName.trim(),
            createdAt: new Date()
        });
    }
    // Sort by speed descending
    servers.sort((a, b) => b.speedMbps - a.speedMbps);
    return servers;
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const DB = process.env.DB_URI || process.env.DB_URI_PRO || process.env.DB_URI_DEV;
        if (!DB) {
            console.error('[Sync] Database connection string (DB_URI_PRO/DB_URI_DEV/DB_URI) is missing in environment variables.');
            process.exit(1);
        }
        console.log('[Sync] Starting VPN Gate database synchronization...');
        let servers = [];
        try {
            console.log('[Sync] Fetching server list CSV from VPN Gate...');
            const response = yield axios_1.default.get(VPNGATE_CSV_URL, {
                responseType: 'text',
                timeout: 30000,
            });
            servers = parseVpnGateCsv(response.data);
            console.log(`[Sync] Successfully parsed ${servers.length} servers from VPN Gate.`);
        }
        catch (error) {
            console.error('[Sync] Failed to fetch or parse VPN Gate CSV:', error.message);
            process.exit(1);
        }
        if (servers.length === 0) {
            console.error('[Sync] Parsed 0 servers. Aborting database replacement to prevent data wipe.');
            process.exit(1);
        }
        try {
            console.log('[Sync] Connecting to MongoDB...');
            yield mongoose_1.default.connect(DB);
            console.log('[Sync] MongoDB connected.');
            console.log('[Sync] Replacing servers in MongoDB...');
            // Replace the collection with the new servers
            yield VpnServer_1.VpnServerModel.deleteMany({});
            const inserted = yield VpnServer_1.VpnServerModel.insertMany(servers);
            console.log(`[Sync] Successfully saved ${inserted.length} servers to MongoDB.`);
        }
        catch (dbError) {
            console.error('[Sync] Database operation failed:', dbError);
            process.exit(1);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('[Sync] Database disconnected. Sync complete.');
        }
    });
}
run();
//# sourceMappingURL=syncVpnGate.js.map