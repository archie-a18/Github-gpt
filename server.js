var express=require('express');
var cors=require('cors');
const fetch=(...args)=>
import ('node-fetch').then(({default:fetch}) => fetch(...args));
var bodyParser=require('body-parser');

const CLIENT_ID="40c133e44f3a59324612";

const CLIENT_SECRET="d052a8fe06347c7ab7ef6077798d1f7337e12170";

var app=express();
app.use(cors());
app.use(bodyParser.json());

//code being passed
app.get('/getAccessToken',async function (req,res){
   console.log( req.query.code);

   const params="?client_id="+CLIENT_ID+"&client_secret="+CLIENT_SECRET+"&code="+req.query.code;

   await fetch("https://github.com/login/oauth/access_token"+params,{
    method : "POST",
    headers:{
        "Accept": "application/json"
    }
   }).then((response)=>{
    return response.json();
   }).then((data)=>{
    console.log(data);
    res.json(data);
   })
});


app.get('/getUserData',async function(req,res){
    req.get("Authorization");
    await fetch("https://api.github.com/user",{
        method: "GET",
        headers:{
            "Authorization":req.get("Authorization")
        }
    }).then((response)=>{
        return response.json();
    }).then((data)=>{
        console.log(data);
        res.json(data);
    });
})


app.listen(4000,function(){
    console.log("server running on port 4000");
});