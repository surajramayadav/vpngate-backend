import { UploadedFile } from 'express-fileupload';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { VpnServerModel } from '../models/VpnServer';
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";
import axios from 'axios';
import fs from 'fs';
import csv from 'csvtojson'
import { cwd } from 'process';
import https from 'https'
const cheerio = require('cheerio');
const os = require("os");
// Add vpn
const getVpn = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {

    const getCsv: any = await axios.get("https://www.vpngate.net/api/iphone/")

    console.log(cwd())
    const path = cwd() + "/src/tmp/vpn.csv"

    // console.log(getCsv.data)


    fs.writeFile(path, getCsv.data, async function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
      const vpn = await csv().fromFile(path)



      res.status(200).json({
        success: true,
        data: vpn,
      });
      fs.unlinkSync(path);
    });


  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});



// Add vpn
const scrapeVPNData = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = "https://www.vpngate.net/en/"

    const resData: any = await axios.get(url)

    const result: any = []
    const $ = cheerio.load(resData.data);
    $('table:nth-child(1) >tbody > tr:nth-child(2) > td > #vg_hosts_table_id >tbody').children().each(async (i: number, element: any) => {

      let flag: string = $(element).find(`tr:nth-child(${i + 1}) > td:nth-child(1) >img`).attr("src")
      if (flag) {
        flag = flag.replace("..", "https://www.vpngate.net")
      }

      let link: string = $(element).find(`tr:nth-child(${i + 1}) > td:nth-child(7) > a`).attr("href")
      const bool = link ? true : false
      link = "https://www.vpngate.net/en/" + link



      result.push({
        country: $(element).find(`tr:nth-child(${i + 1}) > td:nth-child(1)`).text(),
        flag,
        ip: $(element).find(`tr:nth-child(${i + 1}) > td:nth-child(2) > span`).text(),
        speed: $(element).find(`tr:nth-child(${i + 1}) > td:nth-child(4) > b:nth-child(1)`).text(),
        link,
        bool

      })


    })

    // 'table:nth-child(1) >tbody > tr:nth-child(2) > td > #vg_hosts_table_id >tbody'



    res.status(200).json({
      success: true,
      data: result,
    });


  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});




// Add vpn
const downloadConfigFile = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {

    const url = req.body.url

    const resData: any = await axios.get(url)
    // const filePath = cwd() + "/src/tmp/"

    const tempDir = os.tmpdir(); // /tmp
    const path = tempDir + "/file.opvn"
    const $ = cheerio.load(resData.data);
    const downloadPath = $('#vpngate_inner_contents_td > ul:nth-child(8) > li:nth-child(1) > a').attr("href")
    console.log(downloadPath)
    const downloadLink = "https://www.vpngate.net" + downloadPath



    const file = fs.createWriteStream(path);
    https.get(downloadLink, function (response) {
      response.pipe(file);

      // after download completed close filestream

      file.on("finish", () => {
        file.close();
        console.log("Download Completed");


        fs.readFile(path, { encoding: 'utf-8' }, function (err, data) {
          if (!err) {
            // console.log('received data: ' + data);yd
            res.status(200).json({
              success: true,
              data: data,
            });
            fs.unlinkSync(path);
          } else {
            console.log(err);
          }
        });
      });
    });

    file.on("error", (err: any) => {
      console.log("file download error", err)
    })

    // #vpngate_inner_contents_td > ul:nth-child(8) > li:nth-child(1) > a

    // 'table:nth-child(1) >tbody > tr:nth-child(2) > td > #vg_hosts_table_id >tbody'






  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


const scrapeVpnBook = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = "https://www.vpnbook.com/freevpn/openvpn";
    const resData: any = await axios.get(url);
    const $ = cheerio.load(resData.data);

    // Extract Username and Password
    const usernameMatch = resData.data.match(/Username<\/label>[\s\S]*?<code[^>]*>([^<]+)<\/code>/i);
    const passwordMatch = resData.data.match(/Password<\/label>[\s\S]*?<code[^>]*>([^<]+)<\/code>/i);

    const username = usernameMatch ? usernameMatch[1].trim() : "vpnbook";
    const password = passwordMatch ? passwordMatch[1].trim() : "";

    let servers: any = [];

    // Try parsing from Next.js hydration data (primary & most detailed method)
    const startIdx = resData.data.indexOf("\\\"servers\\\":");
    if (startIdx !== -1) {
      const bracketStart = resData.data.indexOf("[", startIdx);
      let bracketCount = 1;
      let endIdx = bracketStart + 1;
      while (bracketCount > 0 && endIdx < resData.data.length) {
        if (resData.data[endIdx] === "[") bracketCount++;
        else if (resData.data[endIdx] === "]") bracketCount--;
        endIdx++;
      }
      const rawJson = resData.data.substring(bracketStart, endIdx);
      const cleanedJson = rawJson.replace(/\\\"/g, "\"");
      try {
        const parsed = JSON.parse(cleanedJson);
        if (Array.isArray(parsed)) {
          servers = parsed.map((s: any) => {
            const cc = s.countryCode ? s.countryCode.toLowerCase() : "";
            const protocols = ["tcp443", "tcp80", "udp53", "udp25000"];
            return {
              name: s.name || s.id,
              hostname: s.hostname,
              ipAddress: s.ipAddress,
              countryCode: s.countryCode,
              countryName: s.countryName,
              flag: cc ? `https://flagcdn.com/${cc}.svg` : "",
              configs: protocols.map(proto => ({
                protocol: proto,
                vpnbook_url: `https://www.vpnbook.com/api/openvpn?hostname=${s.hostname}&protocol=${proto}${s.ipAddress ? `&ip=${s.ipAddress}` : ""}`,
                api_url: `/api/v1/vpn/vpnbook/config?hostname=${s.hostname}&protocol=${proto}`
              }))
            };
          });
        }
      } catch (e) {
        // Fallback to HTML matching
      }
    }

    // Fallback parsing (HTML layout regex)
    if (servers.length === 0) {
      const serverRegex = /<button[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>[\s\S]*?<span class="block text-sm font-semibold text-gray-900">([^<]+)<\/span><span class="text-xs text-gray-500">([^<]+)<\/span>/g;
      let match;
      while ((match = serverRegex.exec(resData.data)) !== null) {
        const flag = match[1];
        const name = match[2].trim();
        const hostname = match[3].trim();
        let countryCode = "";
        const ccMatch = flag.match(/\/([a-zA-Z]{2})\.svg/);
        if (ccMatch) countryCode = ccMatch[1].toUpperCase();

        const protocols = ["tcp443", "tcp80", "udp53", "udp25000"];
        servers.push({
          name,
          hostname,
          countryCode,
          flag,
          configs: protocols.map(proto => ({
            protocol: proto,
            vpnbook_url: `https://www.vpnbook.com/api/openvpn?hostname=${hostname}&protocol=${proto}`,
            api_url: `/api/v1/vpn/vpnbook/config?hostname=${hostname}&protocol=${proto}`
          }))
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        username,
        password,
        servers
      }
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


const downloadVpnBookConfig = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { hostname, protocol } = req.query;
    if (!hostname || !protocol) {
      return next(new ErrorHandler("Hostname and protocol query parameters are required", 400));
    }
    const url = `https://www.vpnbook.com/api/openvpn?hostname=${hostname}&protocol=${protocol}`;
    const response = await axios.get(url, { responseType: 'text' });

    // Set headers to trigger direct file download
    res.setHeader('Content-Type', 'application/x-openvpn-profile');
    res.setHeader('Content-Disposition', `attachment; filename="vpnbook-${hostname}-${protocol}.ovpn"`);
    res.send(response.data);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


// --- Caching Proxy Implementation for VPN Gate ---

// Helper function to parse quoted fields (e.g. Operator field may contain commas)
function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// Generate country flag emoji dynamically from 2-letter ISO code
function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const cc = countryCode.toUpperCase();
  const codePoints = [
    cc.charCodeAt(0) - 65 + 0x1F1E6,
    cc.charCodeAt(1) - 65 + 0x1F1E6
  ];
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '🌐';
  }
}

// Parse raw VPN Gate CSV file into compact JSON
function parseVpnGateCsv(rawText: string): any[] {
  const lines = rawText.split(/\r?\n/);
  const servers: any[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('*') || trimmed.startsWith('#')) continue;

    const cols = parseCsvRow(trimmed);
    if (cols.length < 15) continue;

    const [
      hostName,   // 0
      ip,         // 1
      scoreStr,   // 2
      pingStr,    // 3
      speedStr,   // 4
      countryLong,// 5
      countryShort,// 6
      ,           // 7 NumVpnSessions
      ,           // 8 Uptime
      ,           // 9 TotalUsers
      ,           // 10 TotalTraffic
      ,           // 11 LogType
      ,           // 12 Operator
      ,           // 13 Message
      base64Config,// 14
    ] = cols;

    if (!base64Config || base64Config.trim().length < 10) continue;
    if (!ip || !ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) continue;

    const speedBps = parseInt(speedStr, 10) || 0;
    const speedMbps = parseFloat((speedBps / 1_000_000).toFixed(2));
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
    });
  }

  // Sort by speed descending
  servers.sort((a, b) => b.speedMbps - a.speedMbps);

  return servers;
}

// Lazy database connection helper optimized for serverless environments
const connectDb = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const DB = process.env.DB_URI || process.env.DB_URI_PRO || process.env.DB_URI_DEV || '';
  if (!DB) throw new Error('Database connection URI is missing');
  await mongoose.connect(DB);
};

const getVpnGateCached = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Set Cache-Control headers for Vercel edge caching (10 min fresh, 20 min stale revalidation)
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=1200');

    // 2. Connect to the database
    await connectDb();

    // 3. Query all active servers from database
    const servers = await VpnServerModel.find({}).lean();

    res.status(200).json({
      success: true,
      data: servers,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message || "Failed to retrieve VPN list", 500));
  }
});

export { getVpn, scrapeVPNData, downloadConfigFile, scrapeVpnBook, downloadVpnBookConfig, getVpnGateCached }
