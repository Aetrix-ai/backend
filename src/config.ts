
import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"
import logger from "./lib/logger"
import th from "zod/v4/locales/th.js"
config()


export class Config{
    PORT:string
    DB_URI:string
    JWT_SECRET:string
    prismaClient:PrismaClient
    env : string
    private static instance: Config

    constructor(){
        const PORT = process.env.PORT
        const DB_URI = process.env.DATABASE_URL
        const JWT_SECRET = process.env.JWT_SECRET
        const prisma = new PrismaClient()
        if ( !PORT || !DB_URI || !JWT_SECRET ) {
            logger.error(`Missing environment variables. Please check your .env file.[ ${!PORT ? "PORT" : ""},${!DB_URI ? "DB_URI" : ""},${!JWT_SECRET ? "JWT_SECRET" : ""} ]`);
            throw new Error("Missing environment variables. Please check your .env file.")
        }
        if(!prisma){
            logger.error("Prisma Client not initialized")
            throw new Error("Prisma Client not initialized")
        }
        this.prismaClient = prisma
        this.PORT = PORT
        this.DB_URI =  DB_URI
        this.JWT_SECRET = JWT_SECRET
        this.env = process.env.NODE_ENV || "development"
    }
    static getInstance():Config{

        if(!Config.instance){
            Config.instance = new Config()
        }
        return Config.instance
    }

}
