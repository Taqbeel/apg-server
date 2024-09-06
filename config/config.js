const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    development: {
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        port: process.env.POSTGRES_PORT,
        host: 'localhost',
        dialect: process.env.POSTGRES_USER
    },
    test: {
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        port: process.env.POSTGRES_PORT,
        host: 'localhost',
        dialect: process.env.POSTGRES_USER
    },
    production: {
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        port: process.env.POSTGRES_PORT,
        host: 'localhost',
        dialect: process.env.POSTGRES_USER
    },
    HOST_PORT: process.env.HOST_PORT,
    DB_URL: process.env.DB_URL,
    CONFIG_SERVER: process.env.CONFIG_SERVER,
    CONFIG_USER: process.env.CONFIG_USER,
    CONFIG_PASS: process.env.CONFIG_PASS,
    CONFIG_DB_NAME: process.env.CONFIG_DB_NAME,
    AMZ_REFRESH_URL: process.env.AMZ_REFRESH_URL,

    AMZ_ID_1: process.env.AMZ_ID_1,
    AMZ_NAME_1: process.env.AMZ_NAME_1,
    AMZ_REFRESH_TOKEN_1: process.env.AMZ_REFRESH_TOKEN_1,
    AMZ_CLIENT_ID_1: process.env.AMZ_CLIENT_ID_1,
    AMZ_CLIENT_SECRET_1: process.env.AMZ_CLIENT_SECRET_1,

    AMZ_ID_2: process.env.AMZ_ID_2,
    AMZ_NAME_2: process.env.AMZ_NAME_2,
    AMZ_REFRESH_TOKEN_2: process.env.AMZ_REFRESH_TOKEN_2,
    AMZ_CLIENT_ID_2: process.env.AMZ_CLIENT_ID_2,
    AMZ_CLIENT_SECRET_2: process.env.AMZ_CLIENT_SECRET_2,

    AMZ_ID_3: process.env.AMZ_ID_3,
    AMZ_NAME_3: process.env.AMZ_NAME_3,
    AMZ_REFRESH_TOKEN_3: process.env.AMZ_REFRESH_TOKEN_3,
    AMZ_CLIENT_ID_3: process.env.AMZ_CLIENT_ID_3,
    AMZ_CLIENT_SECRET_3: process.env.AMZ_CLIENT_SECRET_3,

    AMZ_ID_4: process.env.AMZ_ID_4,
    AMZ_NAME_4: process.env.AMZ_NAME_4,
    AMZ_REFRESH_TOKEN_4: process.env.AMZ_REFRESH_TOKEN_4,
    AMZ_CLIENT_ID_4: process.env.AMZ_CLIENT_ID_4,
    AMZ_CLIENT_SECRET_4: process.env.AMZ_CLIENT_SECRET_4,

    SELLING_URL: process.env.SELLING_URL,
    SELLING_URL_SB: process.env.SELLING_URL_SB,
    ALPHA_BRODER_URL: process.env.ALPHA_BRODER_URL,
    ALPHA_BRODER_URL_ONLINE: process.env.ALPHA_BRODER_URL_ONLINE,
    ALPHA_BRODER_URL_REQ: process.env.ALPHA_BRODER_URL_REQ,
    ALPHA_USER: process.env.ALPHA_USER,
    ALPHA_CN: process.env.ALPHA_CN,
    ALPHA_PASS: process.env.ALPHA_PASS,
    ALPHA_BEARER: process.env.ALPHA_BEARER,
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
};