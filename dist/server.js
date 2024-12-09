var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Fastify from 'fastify';
import dotenv from 'dotenv';
import logger from './logger.js';
import { WithdrawRequestSchema } from './schema.js';
import { WithDrawlsManager } from './transfer.js';
dotenv.config();
const valid_api_key = process.env.ApiKey;
const fastify = Fastify({
    logger: true
});
fastify.get('/', (req, res) => {
    res.send('Welcome to Agensic !');
    logger.info(JSON.stringify(req.ip));
});
fastify.post('/crypto/withdraw', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userData = req.body;
    const apiKey = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const { error } = WithdrawRequestSchema.validate(userData);
    if (error) {
        logger.warn(`Invalid withdrawal request data for user ${userData.user_id}`);
        return res.status(400).send({ success: false, error: error.details[0].message });
    }
    const isValidKey = apiKey === valid_api_key;
    if (!userData) {
        logger.warn(`No data sent for withdrawal request`);
        return res.status(400).send({ success: false, error: "No withdrawal request data" });
    }
    if (!isValidKey) {
        logger.warn(`Invalid API key for user ${userData.user_id} during withdrawal request`);
        return res.status(401).send({ success: false, error: "Invalid API key" });
    }
    const result = yield WithDrawlsManager(userData);
    console.log("result : ", result);
    if (!result.success) {
        logger.error(`Failed to process withdrawal request for user ${userData.user_id}, result : ${JSON.stringify(result)}`);
        return res.status(500).send({ success: false, error: result.response || "internal server error" });
    }
    res.status(200).send({ success: true, response: result.response });
}));
try {
    fastify.listen({
        host: "0.0.0.0",
        port: Number(process.env.PORT) || 3000,
    }, (err, address) => {
        if (err)
            throw err;
        console.log(`Server listening at ${address}`);
    });
}
catch (error) {
    console.error(error);
    process.exit(1);
}
