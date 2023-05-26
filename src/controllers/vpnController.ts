
import { UploadedFile } from 'express-fileupload';
import { Request, Response, NextFunction } from 'express';
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




export { getVpn, scrapeVPNData, downloadConfigFile }


