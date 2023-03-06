const { Server } = require('socket.io')
const { createServer } = require('http')
const express = require('express')
const cors = require('cors')
var tmx = require('tmx-parser')
var path = require('path');
const app = express()
app.use(cors())
const httpServer = createServer(app)
const io = new Server(httpServer)


const TICK_RATE = 30
const SPEED = 5
const SHOT_SPEED = 12
const TILE_SIZE = 32

app.set('trust proxy', 1)
 app.use(express.static('public'))
 app.use(express.urlencoded({extended: true}));
app.get('/test', (req, res)=> {
  
    res.sendFile('/test.html')
})


const inputsMaps = {}
let players = []
let shots = []

const tick = (delta) => {
    
    for (const player of players) {
        const inputs = inputsMaps[player.id]
        if (inputs.up) {
            player.y -= SPEED
        } else if (inputs.down) {
            player.y += SPEED
        }

        if (inputs.left) {
            player.x -= SPEED
        } else if (inputs.right) {
            player.x += SPEED
        }

    }

    for (const shot of shots) {
        shot.x += Math.cos(shot.angle) * SHOT_SPEED
        shot.y += Math.sin(shot.angle) * SHOT_SPEED
        shot.timeLeft = shot.timeLeft - delta * 1.1 // length of shot, number multiplying delta makes shot even shorter
      
        // removes shot from array
        shots = shots.filter(shot => shot.timeLeft > 0)

        

        //checking distance between other players and the shot
        for(const player of players){

            // Excluding own player from array of players, to make sure I can-t shoot myself
            if(shot.id == player.id) continue

            const distance = Math.sqrt((player.x - shot.x) ** 2  + (player.y - shot.y) ** 2)
            
            if(distance <= 20) {
                // player.x = 10
                // player.y = 10
                shot.timeLeft = -1
                player.dead = true 
                    
                break
            }
            
            
        }
      
    }
    io.emit('players', players)
    io.emit('shots', shots)
    
}


async function main() {

    
    // app.use(express.static('public'))


    io.on('connect', (socket) => {

        inputsMaps[socket.id] = {
            up: false,
            down: false,
            left: false,
            right: false
        }
        players.push({
            id: socket.id,
            x: Math.floor(Math.random() * (400 - 200)) + 200,
            y: Math.floor(Math.random() * (400 - 200)) + 200,
            dead: false,
            canExplode: true,

        })
        socket.emit('map', {

        })

        socket.on('inputs', (inputs) => {

            // check if the player was hit
            const isDead = players.filter(player => player.id == socket.id)[0].dead
            console.log('isDead', isDead)
            if(!isDead) {
                inputsMaps[socket.id] = inputs
            }else{
                inputsMaps[socket.id] = {
                    up: false,
                    down: false,
                    left: false,
                    right: false
                }
            }
        
        })

        socket.on('shot', (angle) => {

            const player = players.find(player => player.id === socket.id)
            if(!player.dead){
                shots.push({
                    angle: angle.angle,
                    x: player.x + TILE_SIZE,
                    y: player.y + TILE_SIZE,
                    timeLeft: 1000,
                    id: socket.id
                })
            }
          
       
        })
        socket.on('disableExplosion', (hitPlayer)=> {
            const player = players.find(player => player.id === hitPlayer.playerId)
            console.log('hit player', player)
            player.canExplode = false
        })

        socket.on('disconnect', () => {
            players = players.filter(player => player.id != socket.id)

        })
    })

    // IMPORTANT FOR LOCALTUNNEL TESTING
    //lt --port 5000  Bypass-Tunnel-Reminder User-Agent
    httpServer.prependListener("request", (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
     });


    httpServer.listen(5000,
      
        () => {
        console.log('server is running')
    })

    let lastUpdate = Date.now()
    setInterval(() => {
        
        const now = Date.now()
        const delta = now - lastUpdate
        
        tick(delta)
        lastUpdate = now

        
    }, 1000 / TICK_RATE)

}

main()
