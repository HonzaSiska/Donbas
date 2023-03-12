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
const SHOT_SPEED = 8
const TILE_SIZE = 32
const LIVE_REFILL_LIFE_TIME = 12


app.set('trust proxy', 1)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.get('/test', (req, res) => {

    res.sendFile('/test.html')
})


//GENERATE AIRPLANE THET DROPS LIVES, 
let airplanes = []
let lives = []
let planesEnabled = true

const generateAirplane = () => {
    const RANDOM_INTERVAL = Math.floor(Math.random() * (30000 - 20000)) + 20000
    const startX = Math.random(1) > 0.5 ? 600 : 0
    const startSide = startX === 600 ? 'right' : 'left'
    setTimeout(() => {
        const newPlane = {
            id: Math.random(10000),
            x: startX,
            startSide: startSide,
            exitX: Math.abs(startX - 600),
            y: Math.floor(Math.random() * (600 - 50)) + 50,
            dropOffX: Math.floor(Math.random() * (550 - 100)) + 100,
            dropOffY: Math.floor(Math.random() * (550 - 100)) + 100,
            canDropOff: true
        }
        airplanes.push(newPlane)
        // console.log(airplanes)

        if (planesEnabled) generateAirplane()


    }, RANDOM_INTERVAL);
}

generateAirplane()



const inputsMaps = {}
let players = []
let shots = []

const tick = (delta) => {

    for (const player of players) {
        const inputs = inputsMaps[player.id]
        if (inputs.up) {
            if (player.y < 1) {
                player.y = 0
            } else {
                player.y -= SPEED
            }


        } else if (inputs.down) {
            if (player.y > 599) {
                player.y = 600
            } else {
                player.y += SPEED
            }
        }

        if (inputs.left) {
            if (player.x < 1) {
                player.x = 0
            } else {
                player.x -= SPEED
            }

        } else if (inputs.right) {
            if (player.x > 599) {
                player.x = 600
            } else {
                player.x += SPEED
            }

        }


        // PLAYER LIVES UPDATE

        for(const life of lives){
            const distance = Math.sqrt((player.x - life.x) ** 2 + (player.y - life.y) ** 2)
            if(distance <= 20){

                if(player.lives < 5) {
                    const updatedLives = lives.filter(item => item.id !== life.id)
                    lives = updatedLives
                    player.lives += 1
                    io.sockets.emit('pickup_sound')
                }
            }
        }

    }

    for (const shot of shots) {
        shot.x += Math.cos(shot.angle) * SHOT_SPEED
        shot.y += Math.sin(shot.angle) * SHOT_SPEED
        shot.timeLeft = shot.timeLeft - delta * 1.1 // length of shot, number multiplying delta makes shot even shorter

        // removes shot from array
        shots = shots.filter(shot => shot.timeLeft > 0)



        //checking distance between other players and the shot
        for (const player of players) {

            // Excluding own player from array of players, to make sure I can-t shoot myself
            if (shot.id == player.id) continue

            const distance = Math.sqrt((player.x - shot.x) ** 2 + (player.y - shot.y) ** 2)

            if (distance <= 20) {
                // player.x = 10
                // player.y = 10
                shot.timeLeft = -1

                if (player.lives > 0) player.canExplode = true

                if (!player.justHit && player.lives > 0) player.lives -= 1

                if (player.lives < 1) {
                    player.dead = true
                }
                // TO MAKE SURE THE PLAYER DOESNT LOOSE MORE THAN 1 LIVE WHEN HIT WITH MULTIPLE SHOTS
                player.justHit = true
                setTimeout(() => {
                    player.justHit = false
                }, 2000)


                // ENABLES REMOVAL OF PLAYER
                if (player.dead) {
                    setTimeout(() => {
                        player.canBeRemoved = true
                    }, 5000);
                }
                break
            }
        }
    }

    // REMOVES DEAD PLAYER FROM THE GAME AFTER 5 SECS

    const updatedPlayers = players.filter(player => player.canBeRemoved !== true)
    if (updatedPlayers) players = updatedPlayers

    //UPDATE PLANES POSITION 

    if (airplanes.length > 0) {
        for (const plane of airplanes) {
            plane.startSide === 'left' ? plane.x += 5  : plane.x -= 5 

            // REMOVE PLANES WHEN THEY GET OUT OF BOUNDS OF CANVAS

            if (plane.startSide === 'left' && plane.x >= plane.exitX + 50) {
                const updatedPlanes = airplanes.filter(airplane => airplane.id !== plane.id)
                airplanes = updatedPlanes
            }

            if (plane.startSide === 'right' && plane.x <= plane.exitX - 50) {

                const updatedPlanes = airplanes.filter(airplane => airplane.id !== plane.id)
                airplanes = updatedPlanes
            }

            // DROP EXTRA LIVES

            if(Math.abs(plane.x - plane.dropOffX) <= 5 && plane.canDropOff){
                plane.canDropOff = false
                const life = {
                    id: Math.random() * 10000,
                    x: plane.x,
                    y: plane.y -10,

                }
                lives.push(life)
                setTimeout(()=> {
                    const updatedLives = lives.filter(item => item.id === life.id)
                    
                    lives = updatedLives

                    
                }, LIVE_REFILL_LIFE_TIME)
            }


        }
    }

   

    
    //DISPATCH

    io.emit('airplane', airplanes)
    io.emit('players', players)
    io.emit('shots', shots)
    io.emit('lives', lives)

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

        if (players.length < 5) {
            players.push({
                id: socket.id,
                x: Math.floor(Math.random() * (400 - 200)) + 200,
                y: Math.floor(Math.random() * (400 - 200)) + 200,
                dead: false,
                canExplode: false,
                lives: 5,
                justHit: false,
                canBeRemoved: false,
            })
        }
        socket.emit('map', {

        })

        socket.on('inputs', (inputs) => {

            // check if the player was hit
            const isDead = players.filter(player => player.id == socket.id)[0].dead
            console.log('isDead', isDead)
            if (!isDead) {
                inputsMaps[socket.id] = inputs
            } else {
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
            if (!player.dead) {
                shots.push({
                    angle: angle.angle,
                    x: player.x + TILE_SIZE,
                    y: player.y + TILE_SIZE,
                    timeLeft: 1000,
                    id: socket.id
                })
            }


        })
        socket.on('disableExplosion', (hitPlayer) => {
            const player = players.find(player => player.id === hitPlayer.playerId)
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
