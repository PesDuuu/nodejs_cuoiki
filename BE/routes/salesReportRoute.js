const express = require("express");
const jwtAuth = require("../middlewares/jwtAuth");
const authorize = require("../middlewares/authorize");
const salesReportController = require("../controllers/salesReportController");

const router = express.Router();

router.get("/", jwtAuth, authorize, salesReportController.getSalesReports);

module.exports = router;
