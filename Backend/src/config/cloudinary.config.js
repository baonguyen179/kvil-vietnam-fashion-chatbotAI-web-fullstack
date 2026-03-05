require('dotenv').config()
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME || 'dnj77wstm',
    api_key: process.env.CLOUDINARY_KEY || 'YOUR_API_KEY',
    api_secret: process.env.CLOUDINARY_SECRET || 'YOUR_API_SECRET'
});

const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    params: {
        folder: 'kvil_ecommerce'
    }
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;