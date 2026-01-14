import ImageKit from "@imagekit/nodejs";
import { Config } from "../../config.js";



export const ImageKitClient = new ImageKit({
  privateKey: Config.IMAGEKIT_PRIVATE_KEY,
});



