import Joi from 'joi';
export const WithdrawRequestSchema = Joi.object({
    user_id: Joi.string().required(),
    amount_usd: Joi.number().required(),
    address: Joi.string().required(),
    user_balance_usd: Joi.number().required(),
    init_transaction_id: Joi.string(),
    transaction_id: Joi.string(),
    network_data: Joi.object({
        network_id: Joi.string().required(),
        network_name: Joi.string().valid('ethereum', 'tron'),
    }).required(),
});
