//hi
//so lets get this thing started
//my name is charlie, I made this server code with the help of too many online sources to name, and many sleepless nights learning what acronyms meant what
//Special Thanks: Danny Hawk | Emi Schaufeld | the guy who made hackbox 

//#region REQ_Vars
//const fs = require("fs"); //might be useful for rando generation - file system was used in the example to read a cvs for randomly generated categories
const express = require('express'); //using express for the app
var app = express();//the app 

var server = require('http').Server(app); //create the server using the app
let port = process.env.PORT || process.env.NODE_PORT || 8080; //port details

const io = require('socket.io').listen(server); //create the io var
//const io = require("socket.io")(http, {pingInterval: 500});
const Room = require("./modules/room"); //the room class - see hackbox
const Player = require("./modules/player"); //the player class see hackbox
const { emit } = require("process");

////#endregion

//#region game variables
let rooms = new Map();
connections =[];

//#endregion


//#region StartServer
server.listen(port);
console.log ('server running... ');
//#endregion



//use the public folder for my web client
app.use(express.static('public', express.static(__dirname + 'public')));
//app.use(express.static('/js', express.static(__dirname + '/js')));
//app.use(express.static('/css', express.static(__dirname + '/css')));
//app.use(express.static('/assets', express.static(__dirname + '/assets')));

//app.get? connections aren't working for app.use

//#region StartWebApp on the index page
app.get('/', function(req, res){
   res.sendFile(__dirname + '/index.html');//this is the starting page
});
//#endregion

//#region EmitEvents
io.sockets.on('connection', Connections);

function Connections(socket){
    //all the events that we need to emit go in HERE
    //connections list being used here?
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);
    console.log('new connection: ' + socket.id);

    //lobby logic
    socket.on("u_roomcode", (data) => {
        console.log("starting up a new room");
        let roomcode = {};
        let room = new Room(getRandomRoomCode()); // get random room code
        rooms.set(room.code, room);
        roomcode = room.code;

        // Also join this client to the room
        console.log("I've gotten the join room request from room: " + room.code);
        let res ={};
        if(rooms.has(room.code)){
            
            let thisroom = rooms.get(room.code);
            if (thisroom.players.length < 5){
            res.playerCount = thisroom.players.length;
            let nun = {}
                socket.join(room.code);
                
                thisroom.players.push(new Player(data.user, thisroom.players.length +1));
                //console.log("I have added the player with a number of" +)
                res.joined = true;
                res.user = data.user;
                room.usernames.push(data.user);
                //res.failReason = "";
                res.playerCount = thisroom.players.length;
                nun.user = res.user;
                nun.usernum = res.playerCount;
                let tit = {}
                tit.players = room.usernames;
                // Notify the entire room of success
                socket.emit("s_joinroom", res);
                socket.to(room.code).emit("s_playerlist",tit);  
                //socket.to(room.code).emit("s_newuser", nun);
                console.log("I have added  " + data.user + " to the room: " + room.code + "With the player number of: "+ room.players.length);
            
            }
        ///
        socket.join(room.code);
        console.log('the room code is being sent: ' + room.code);
        
        socket.emit("s_roomcode", {roomcode});
      
    }
});

    socket.on("u_roomclose", (data) =>{
        let room = rooms.get(data.roomcode);

        io.to(data.roomcode).emit("s_closeroom");
        //send out to all people to close the room
        // Remove socket.io room
       //socketIds.forEach(socketId => io.sockets[socketId].leave(data.roomcode));
       rooms.delete(data.roomcode);

    });
    
    socket.on("u_joinroom", data => { 
        //let dataObj = JSON.parse(data);
        console.log("I've gotten the join room request from room: " + data.roomcode)
        let res ={};
        if(rooms.has(data.roomcode)){
            
            let room = rooms.get(data.roomcode);
            if (room.players.length < 5){
            res.playerCount = room.players.length;
            let nun = {}
                socket.join(data.roomcode);
                
                room.players.push(new Player(data.user, room.players.length+1));
                room.usernames.push(data.user);
                res.joined = true;
                res.user = data.user;
                res.failReason = "";
                res.playerCount = room.players.length;
                nun.user = res.user;
                nun.usernum = res.playerCount;
                let lil ={}
                lil.roomcode = data.roomcode;
                // Notify the entire room of success
                socket.emit("s_joinroom", lil);  
            let tit = {}
                tit.players = room.usernames;
                socket.to(data.roomcode).emit("s_newuser", nun);
                socket.to(data.roomcode).emit("s_playerlist",tit);
                socket.emit("s_playerlist",tit);
                console.log("I have added  " + data.user + " to the room: " + data.roomcode + "With the player number of: "+ room.players.length);
            
            }
        }
        
        else
        {
            res.joined = false;
            res.user = "";
            res.failReason = "Room does not exist or has too many players";
            res.playerCount = 0;console.log("I have not added  " + data.user + " to the room: " + data.roomcode + " because it does not exist");
            socket.emit("s_joinroom",res);

        }
        //add the thing to the room just like it was in the other one
        // send an emit s_newuser to the unity client
       

    });

   
  
    //game beginning and end logic
    socket.on("u_startgame",(data)=>{
        console.log("I am starting the game");

        let thisRoom = rooms.get(data.roomcode);
        
        let res ={}
        res.newplayer = thisRoom.players;

        socket.to(data.roomcode).emit("s_startgame",res);
        socket.emit("s_startgame",res);
    });

    socket.on("u_gameover",(data)=>{
        socket.in(data.roomcode).emit("s_gameover");
        socket.emit("s_gameover");
    });


    //vertical slice logic phase 1
    //b

   
    socket.on("u_changestate", (data)=> {
        socket.to(data.roomcode).emit("s_changestate", data);
    });

    socket.on("u_addtoscore", (data)=>{
        socket.to(data.roomcode).emit("s_addtoscore", data);
    });

    socket.on("u_loseacat",data=>{
        socket.to(data.roomcode).emit("s_loseacat");
    });
    //disconnect stuff
    socket.on('disconnect', function(data)
    {
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
    });
    
    
};

function getRandomRoomCode() {
    let roomCode;
    let char;

    do{
        roomCode = ""; //reset the room code

        for(let i = 0; i < 4; i=i+1)
        {
            //get random ascii char from A-Z
            char = 65 + Math.floor(Math.random() * 26);

            //add it to the roomcode string
            roomCode += String.fromCharCode(char);
        }

    } while(rooms.has(roomCode)); //loop until the room code is unique

    return roomCode;
};

//#endregion