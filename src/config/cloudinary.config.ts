import { v2 as cloudinary } from "cloudinary";
import { ENVIRONMENTS } from "../constants";

cloudinary.config({
  cloud_name: ENVIRONMENTS.CLOUDINARY_CLOUD_NAME,
  api_key: ENVIRONMENTS.CLOUDINARY_API_KEY,
  api_secret: ENVIRONMENTS.CLOUDINARY_API_SECRET,
});

export default cloudinary;
