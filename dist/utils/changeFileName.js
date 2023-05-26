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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeFileName = void 0;
const uuid_1 = require("uuid");
const ChangeFileName = (card) => __awaiter(void 0, void 0, void 0, function* () {
    let res;
    try {
        if (card.mimetype == "image/png") {
            const newName = (0, uuid_1.v4)();
            res = newName + ".png";
        }
        else if (card.mimetype == "image/jpeg") {
            const newName = (0, uuid_1.v4)();
            res = newName + ".jpeg";
        }
        else if (card.mimetype == "image/jpg") {
            const newName = (0, uuid_1.v4)();
            res = newName + ".jpg";
        }
        const folderLocation = "public/images/";
        const uploadLocaton = folderLocation.concat(res);
        card.mv(uploadLocaton, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
    return res;
});
exports.ChangeFileName = ChangeFileName;
//# sourceMappingURL=changeFileName.js.map