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
exports.downloadConfigFile = exports.scrapeVPNData = exports.getVpn = void 0;
const catchAsyncErrors_1 = __importDefault(require("../middleware/catchAsyncErrors"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const csvtojson_1 = __importDefault(require("csvtojson"));
const process_1 = require("process");
const https_1 = __importDefault(require("https"));
const cheerio = require('cheerio');
// Add vpn
const getVpn = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getCsv = yield axios_1.default.get("https://www.vpngate.net/api/iphone/");
        console.log((0, process_1.cwd)());
        const path = (0, process_1.cwd)() + "/src/tmp/vpn.csv";
        // console.log(getCsv.data)
        fs_1.default.writeFile(path, getCsv.data, function (err) {
            return __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
                const vpn = yield (0, csvtojson_1.default)().fromFile(path);
                res.status(200).json({
                    success: true,
                    data: vpn,
                });
                fs_1.default.unlinkSync(path);
            });
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
exports.getVpn = getVpn;
// Add vpn
const scrapeVPNData = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = "https://www.vpngate.net/en/";
        const resData = yield axios_1.default.get(url);
        const result = [];
        const $ = cheerio.load(resData.data);
        $('table:nth-child(1) >tbody > tr:nth-child(2) > td > #vg_hosts_table_id >tbody').children().each((i, element) => __awaiter(void 0, void 0, void 0, function* () {
            let flag = $(element).find(`tr:nth-child(${i + 1}) > td:nth-child(1) >img`).attr("src");
            if (flag) {
                flag = flag.replace("..", "https://www.vpngate.net");
            }
            let link = $(element).find(`tr:nth-child(${i + 1}) > td:nth-child(7) > a`).attr("href");
            const bool = link ? true : false;
            link = "https://www.vpngate.net/en/" + link;
            result.push({
                country: $(element).find(`tr:nth-child(${i + 1}) > td:nth-child(1)`).text(),
                flag,
                ip: $(element).find(`tr:nth-child(${i + 1}) > td:nth-child(2) > span`).text(),
                speed: $(element).find(`tr:nth-child(${i + 1}) > td:nth-child(4) > b:nth-child(1)`).text(),
                link,
                bool
            });
        }));
        // 'table:nth-child(1) >tbody > tr:nth-child(2) > td > #vg_hosts_table_id >tbody'
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
exports.scrapeVPNData = scrapeVPNData;
// Add vpn
const downloadConfigFile = (0, catchAsyncErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = req.body.url;
        const resData = yield axios_1.default.get(url);
        const path = (0, process_1.cwd)() + "/src/tmp/file.opvn";
        const $ = cheerio.load(resData.data);
        const downloadPath = $('#vpngate_inner_contents_td > ul:nth-child(8) > li:nth-child(1) > a').attr("href");
        console.log(downloadPath);
        const downloadLink = "https://www.vpngate.net" + downloadPath;
        const file = fs_1.default.createWriteStream(path);
        https_1.default.get(downloadLink, function (response) {
            response.pipe(file);
            // after download completed close filestream
            file.on("finish", () => {
                file.close();
                console.log("Download Completed");
                fs_1.default.readFile(path, { encoding: 'utf-8' }, function (err, data) {
                    if (!err) {
                        console.log('received data: ' + data);
                        res.status(200).json({
                            success: true,
                            data: data,
                        });
                        fs_1.default.unlinkSync(path);
                    }
                    else {
                        console.log(err);
                    }
                });
            });
        });
        // #vpngate_inner_contents_td > ul:nth-child(8) > li:nth-child(1) > a
        // 'table:nth-child(1) >tbody > tr:nth-child(2) > td > #vg_hosts_table_id >tbody'
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
exports.downloadConfigFile = downloadConfigFile;
//# sourceMappingURL=vpnController.js.map