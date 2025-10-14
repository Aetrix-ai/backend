import { config } from "dotenv"
config()


export class Config{
    PORT:string
    DB_URI:string
    JWT_SECRET:string
    private static instance: Config

    constructor(){
        const PORT = process.env.PORT
        const DB_URI = process.env.DB_URI
        const JWT_SECRET = process.env.JWT_SECRET

        if ( !PORT || !DB_URI || !JWT_SECRET ) {
            throw new Error(`Missing required environment variables: ${!PORT ? "PORT" : ""} ${!DB_URI ? "DB_URI" : ""} ${!JWT_SECRET ? "JWT_SECRET" : ""}`);
        }

        this.PORT = PORT
        this.DB_URI =  DB_URI
        this.JWT_SECRET = JWT_SECRET
    }
    static getInstance():Config{
        if(!Config.instance){
            Config.instance = new Config()
        }
        return Config.instance
    }

}
