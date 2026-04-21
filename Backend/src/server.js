require('dotenv').config()

const express = require('express')
const connection = require('./config/connectDB')
var morgan = require('morgan')
const notFoundHandler = require('./middleware/notFond')
const configCORS = require('./middleware/CORS')
const cookieParser = require('cookie-parser')
const apiRouter = require('./routes/api')//CSR
const { startEmailWorker } = require('./workers/email.worker');

const app = express()
const port = process.env.PORT || 8081
const hostname = process.env.HOST_NAME

app.use(configCORS);
app.use(morgan('dev'))//read logging in console
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//config cookies-pa
app.use(cookieParser(process.env.COOKIE_SECRET_KEY));

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Server is awake!",
        timestamp: new Date().toLocaleString()
    });
});
//khai báo route
app.use('/api/v1', apiRouter)


//-Khai bao middware

//handle 404 not found
app.use(notFoundHandler);
// Add headers before the routes are defined


if (process.env.NODE_ENV !== 'test') {
    ; (async () => {
        try {
            connection();
            app.listen(port, () => {
                console.log(`>>> Server chạy trên port ${port}.`);
                startEmailWorker();
            });
        } catch (error) {
            console.error('>>> App hỏng:', error);
        }
    })();
}
module.exports = app;