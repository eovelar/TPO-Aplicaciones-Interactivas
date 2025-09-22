"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyJson = void 0;
const prettyJson = (res, data, status = 200) => {
    res.status(status).send(JSON.stringify(data, null, 2));
};
exports.prettyJson = prettyJson;
