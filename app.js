var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mysql = require('mysql');
var crypto = require('crypto')
var cookieParser = require('cookie-parser');


app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set("view engine","ejs");
app.use(cookieParser());

var db = mysql.createConnection({
    host: "flashcard.cso3ypvtwtdo.ap-south-1.rds.amazonaws.com",
    port: "3306",
    user: "root",
    password: "admin1234",
    database: "flashcard"
})
app.get("/",function(req,res){
    res.render("index")
})

app.post("/",function(req,res){
    var password=req.body.password;
    var email=req.body.email;
    var hash = crypto.createHash('md5').update(password).digest('hex');
    q="SELECT * FROM user_data WHERE email='"+email+"'AND password ='"+hash+"'";
    db.query(q,function(err,result){
        if(result=="")
        {
            res.send("Invalid Username or Password or No such user");
        }
        else
        {
            res.cookie("email",email,{ sameSite: 'none', secure: true});
            res.send("<script>window.location.replace('todolist')</script>");
        }
    })
})

app.get("/todolist",function(req,res){
    var email=req.cookies.email;
    if(email=='undefined')
        res.redirect("/")
    var q="Select * from flashcards WHERE email='"+email+"'";
    db.query(q,function(err,resp){
        if(err)
            console.log(err);
        res.render("todolist",{
            data:resp,
            email:email
        });
    })
})

app.post("/todolist",function(req,res){

    var fl_id = req.body.fl_id;
    var q="UPDATE flashcards SET done='Done' WHERE flashcard_id="+"'"+fl_id+"'";
    db.query(q,function(err,result){
        if(err)
            console.log(err)
        res.send("<script>alert('task has been marked done');window.location.replace('todolist')</script>");
    })

})
app.get("/add-task",function(req,res){
    res.render("add-task")
})
app.post("/add-task",function(req,res){
    var heading = req.body.heading;
    var description = req.body.desc;
    var email=req.cookies.email
    var q = "INSERT INTO flashcards (email,heading,description,done) VALUES ('"+email+"','"+heading+"','"+description+"','Not Yet Done');"
    db.query(q,function(err,result){
        if(err)
            console.log(err);
        res.send("<script>alert('task has been added in the todolist');window.location.replace('todolist')</script>")
    })
})

app.get("/logout",function(req,res){
    res.clearCookie("email")
    res.render("logout");
})

app.get("/signup",function(req,res){
    res.render("signup");
})
app.post("/signup",function(req,res){
    var email=req.body.email;
    var pass=req.body.password;
    var hash = crypto.createHash('md5').update(pass).digest('hex');
    q="INSERT INTO user_data (email,password) VALUES ('"+email+"','"+hash+"');"
    db.query(q,function(err,result){
        if(err)
            console.log(err)
        res.send("<script>alert('Account successfully created, you may login now');window.location.replace('/')</script>")
    })
})
var server = app.listen('8080',function(){
    var host = server.address();
}) 