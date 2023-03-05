import TileMap from './TileMap.js'





const canvas = document.querySelector('#game')


const cannonSound = new Audio('./cannon.mp3')
const explosion = new Audio('./explosion.wav')


const ctx = canvas.getContext('2d')
const TILE_SIZE = 32

let myId = null


// const pointerImage = new Image()
// pointerImage.src = './pointer.png'




// MAP
const tileMap = new TileMap(TILE_SIZE, canvas)
tileMap.createMapArray()


// PLAYERS

let players = []
let shots = []
const tankImage = new Image()
tankImage.src = '/Hull_02.png'

const inputs = {
    up: false,
    down: false,
    left: false,
    right: false
}

// FIRE

const fireImage = new Image()
fireImage.src ='/fire.png'


window.addEventListener('keydown', (e) => {
    e.preventDefault()

    if (e.key === 'ArrowDown') inputs['down'] = true
    if (e.key === 'ArrowUp') inputs['up'] = true
    if (e.key === 'ArrowLeft') inputs['left'] = true
    if (e.key === 'ArrowRight') inputs['right'] = true

    socket.emit('inputs', inputs)

})

window.addEventListener('keyup', (e) => {
    e.preventDefault()
    if (e.key === 'ArrowDown') inputs['down'] = false
    if (e.key === 'ArrowUp') inputs['up'] = false
    if (e.key === 'ArrowLeft') inputs['left'] = false
    if (e.key === 'ArrowRight') inputs['right'] = false

    socket.emit('inputs', inputs)


})



///SHOOTING
window.addEventListener('click', (e) => {
    
    const currentPlayer = players.find(player => player.id === socket.id)
    if(currentPlayer.dead) return
    // const angle = Math.atan2(e.clientY - canvas.height, e.clientX - canvas.width)
        const angle = Math.atan2(e.clientY - canvas.height / 2 , e.clientX  - canvas.height / 2 )
    
    socket.emit('shot', {
        angle
    })
    

})

// const pointer = document.querySelector('#pointer') 


// window.addEventListener('mousemove', (e)=> {
//     pointer.style.left = e.clientX - pointer.width / 2 + 'px'
//     pointer.style.top = e.clientY   - pointer.width / 2 + 'px'
  
// })



const socket = io('ws://localhost:5000',{
    transports: ['websocket', 'polling', 'flashsocket']
})

socket.on('connect', () => {

})

socket.on('players', (serverPlayers) => {
    players = serverPlayers
})

socket.on('shots', (serverShots) => {
    
    shots = serverShots

})


function loop() {


    // tankPosX < 100 ? tankPosX = tankPosX + Math.random() * 3  : tankPosX = 100


    // const cameraX = myPlayer.x - canvas.width

    // const myPlayer = players.find((player) => player.id === socket.id)
    // let cameraX = 0
    // let cameraY = 0
    
    // if(myPlayer){
    //      cameraX = parseInt(myPlayer.x - canvas.width/2)
    //      cameraY  = parseInt(myPlayer.y - canvas.height/2)
    // }


    
    tileMap.draw(canvas, ctx)

    

    // draw tank(player) on canvas
    for (const player of players) {
        ctx.drawImage(tankImage, player.x, player.y, 40, 40)
        if(player.dead) {
            
            ctx.drawImage(fireImage, player.x, player.y, 40, 40)
            if(player.canExplode){
                explosion.playbackRate = 1
                explosion.play()
                socket.emit('disableExplosion', {
                    playerId: player.id
                })
            }
        }
        
    }
    
    

    for (const shot of shots) {
        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = 'gray';
        ctx.fillStyle = 'gray'
        ctx.arc(shot.x, shot.y, 3, 0, 2 * Math.PI)
        ctx.fill();

        cannonSound.playbackRate = 5
        cannonSound.play()
        
    }


    window.requestAnimationFrame(loop)
}

window.requestAnimationFrame(loop)