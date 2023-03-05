var express = require("express");

var router = express.Router();

router.get("/",function(req,res){
    //console.log("hello aku hernan");
    res.render("base");
});

module.exports = router;