require('dotenv').config()
const express = require('express')
const connection = require('./config/connectDB')
var morgan = require('morgan')
const notFoundHandler = require('./middleware/notFond')
const configCORS = require('./middleware/CORS')
const cookieParser = require('cookie-parser')
const apiRouter = require('./routes/api')//CSR

const app = express()
const port = process.env.PORT || 8081
const hostname = process.env.HOST_NAME

app.use(configCORS);
app.use(morgan('dev'))//read logging in console
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//config cookies-pa
app.use(cookieParser())


//khai báo route
app.use('/api/v1/', apiRouter)

//test sequelize db
connection();
//Khai bao middware

//handle 404 not found
app.use(notFoundHandler);
// Add headers before the routes are defined


; (async () => {
    try {
        // await connectDB(); // Kết nối DB trước
        app.listen(port, () => {
            console.log(`>>> Server chạy tại: http://${hostname}:${port}`);
        });
    } catch (error) {
        console.error('>>> App hỏng:', error);
    }
})();