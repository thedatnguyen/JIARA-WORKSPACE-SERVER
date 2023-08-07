var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var rateLimit = require('express-rate-limit');
var bodyParser = require('body-parser');

const apiLimiter = rateLimit({
  windowMs: 1000 * 60 * 5, // 5 minute
  max: 50,
  handler: (req, res) => {
    res.status(429).send({ message: "Too many request (limit: 50 per 5 mins). Try again after 5 minutes." });
  }
});

const adminRouter = require("./routes/adminRouter");
const authRouter = require("./routes/authRouter");
const accountsRouter = require("./routes/accountsRouter");
const groupsRouter = require("./routes/groupsRouter");
const pendingsRouter = require("./routes/pendingsRouter");
const chatsRouter = require("./routes/chatsRouter");
const personalRouter = require("./routes/personalRouter");

var app = express();
require("dotenv").config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(apiLimiter);


app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/accounts", accountsRouter);
app.use("/groups", groupsRouter);
app.use("/pendings", pendingsRouter);
app.use("/messages", chatsRouter);
app.use("/personal", require("body-parser").raw(), personalRouter);

app.put('/personal', bodyParser.raw({ inflate: true, limit: '50mb', type: () => true }), async (req, res) => {
  res.json({ bodySize: req.body.length });
});



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send({ message: err.message });
  //res.render('error');
});

global.__path_default_avatar = `${__dirname}/public/images/default-avatar.png`;

module.exports = app;
