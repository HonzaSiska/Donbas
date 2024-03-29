import TileMap from './TileMap.js'


const canvas = document.querySelector('#game')

const cannonSound = new Audio('./cannon.mp3')
const explosion = new Audio('./explosion.wav')



const ctx = canvas.getContext('2d')
const TILE_SIZE = 32

let myId = null

// const pointerImage = new Image()
// pointerImage.src = './pointer.png'

// LIVES

// const allLiveTags = document.querySelectorAll('.live-wrapper')
//         allLiveTags && allLiveTags.forEach(element => {
//             document.querySelector('body').removeChild(element)
//         });



// Tiltle music

let musicPlaying = false
const draconusAudio = new Audio()
draconusAudio.src = './draconus.mp3'
draconusAudio.setAttribute('autoplay', true)
draconusAudio.setAttribute('playsinline', true)
draconusAudio.setAttribute('loop', true)
const switchButton = document.querySelector('#switch')




window.addEventListener('resize', (e) => {
    // switchButton.innerText = window.innerWidth

    if (canvas.width > window.innerWidth - 100) {
        switchButton.style.opacity = '0.4'
    } else {
        switchButton.style.opacity = '1'
    }
})


switchButton.addEventListener('click', (e) => {
    if (musicPlaying === false) {
        draconusAudio.play()
        switchButton.innerText = 'Music On'
        musicPlaying = !musicPlaying
    } else {
        draconusAudio.pause()
        switchButton.innerText = 'Music Off'
        musicPlaying = !musicPlaying
    }


})



// CHAT
let hasJoinedChat = false

const joinBtn = document.querySelector('#join-btn')
const joinInput = document.querySelector('#username-input')
const sendBtn = document.querySelector('#message-btn')
const chat = document.querySelector('#chat')
const messageInput = document.querySelector('#message-input')
joinBtn.addEventListener('click', () => {
    if (joinInput.value !== '') {
        socket.user = joinInput
        hasJoinedChat = true
        socket.emit('newUser', joinInput.value)
        // alert(joinInput.value)
    }
})

sendBtn.addEventListener('click', () => {
    if (messageInput.value !== '') {

        socket.emit('newMessage', messageInput.value)
        messageInput.value = ''
        // alert(joinInput.value)
    }
})

messageInput.addEventListener('keydown', (e)=> {
    if(e.key === 'Enter'){
        if (messageInput.value !== '') {
            socket.emit('newMessage', messageInput.value)
            messageInput.value =''
            // alert(joinInput.value)
        }
    }
})


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
fireImage.src = '/fire.png'

// SMOKE

const smokeImage = new Image()
smokeImage.src = '/smoke.png'


// AIRPLANES

let airplanes = []

// LIVES

let lives = []
const lifeImage = new Image()
lifeImage.src = '/first-aid2.png'

window.addEventListener('keydown', (e) => {
    // e.preventDefault()

    if (e.key === 'ArrowDown') inputs['down'] = true
    if (e.key === 'ArrowUp') inputs['up'] = true
    if (e.key === 'ArrowLeft') inputs['left'] = true
    if (e.key === 'ArrowRight') inputs['right'] = true

    socket.emit('inputs', inputs)

})

window.addEventListener('keyup', (e) => {
    //e.preventDefault()
    if (e.key === 'ArrowDown') inputs['down'] = false
    if (e.key === 'ArrowUp') inputs['up'] = false
    if (e.key === 'ArrowLeft') inputs['left'] = false
    if (e.key === 'ArrowRight') inputs['right'] = false

    socket.emit('inputs', inputs)


})



///SHOOTING
window.addEventListener('click', (e) => {

    const currentPlayer = players.find(player => player.id === socket.id)
    if (currentPlayer.dead) return
    cannonSound.playbackRate = 5
    cannonSound.play()

    // const angle = Math.atan2(e.clientY - canvas.height, e.clientX - canvas.width)
    const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.height / 2)

    socket.emit('shot', {
        angle
    })


})

//POINTER

const pointer = document.querySelector('#pointer')

window.addEventListener('mousemove', (e) => {
    pointer.style.left = e.clientX - pointer.width / 2 + 'px'
    pointer.style.top = (e.clientY - pointer.width / 2) + 50 + 'px'

})

//PRODUCTION SOCKET.IO URL

const socket = io('https://donbas.onrender.com', {
    transports: ['websocket', 'polling', 'flashsocket']
})


// DEVELOPMENT SOCKET.IO URL
// const socket = io('ws://localhost:5000', {
//     transports: ['websocket', 'polling', 'flashsocket']
// })

socket.on('connect', () => {

})

socket.on('players', (serverPlayers) => {
    players = serverPlayers
})

socket.on('shots', (serverShots) => {

    shots = serverShots

})

socket.on('airplane', (serverPlanes) => {
    airplanes = serverPlanes

})

socket.on('lives', (serverLives) => {
    lives = serverLives

})

socket.on('pickup_sound', () => {
    const pickupSound = new Audio('./pickup2.wav')
    pickupSound.play()

})

socket.on('newJoin', (data) => {
    
    const chatWrapper = document.querySelector('#chat-wrapper')
    const joinWrapper = document.querySelector('#join-wrapper')
    const name = data.currentUser.id === socket.id ? 'You' : data.currentUser.name
    chat.innerHTML = chat.innerHTML + `<span class='joinin-message'><strong>${name}</strong> just joined in !!</span>`
    chat.scrollTop = chat.scrollHeight
    if(hasJoinedChat) chatWrapper.style.display ='block'
    if(hasJoinedChat) joinWrapper.style.display = 'none'


})

socket.on('newMessageServer', (data) => {
    const position = data.currentUser.id === socket.id  ? 'end' : 'start'
    const color = data.currentUser.id === socket.id  ? '#80bfff' : '#fce0c5'
    chat.innerHTML = chat.innerHTML + `<div style='justify-content:${position};' class='new-message-wrapper ${position}'><div style='background: ${color}' class='new-message'>
        <div class='message-header'>
            <span><strong>${data.currentUser.name}</strong></span></span>
        </div>
        <div class='message-body'>
            <span>${data.message}</span>
        </div>
        
        </div></div>`
    chat.scrollTop = chat.scrollHeight
    const pickupSound = new Audio('./pickup2.wav')
    pickupSound.playbackRate = 6
    pickupSound.play()
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
        //LIVES



        //circle
        ctx.beginPath();
        // ctx.lineWidth = "2";
        if (player.lives === 5) ctx.strokeStyle = 'green'
        if (player.lives < 5 && player.lives > 0) ctx.strokeStyle = 'gray'
        if (player.lives < 1) ctx.strokeStyle = 'red'
        ctx.fillStyle = 'white'
        ctx.arc(player.x, player.y, 10, 1, 2 * Math.PI)
        ctx.fill();
        ctx.stroke();

        //text
        ctx.font = "15px Arial";
        if (player.lives >= 5) ctx.fillStyle = 'green'
        if (player.lives < 5 && player.lives > 0) ctx.fillStyle = 'gray'
        if (player.lives < 1) ctx.fillStyle = 'red'
        ctx.fillText(player.lives, player.x - 5, player.y + 5);

        //CAN EXPLODE IF PLAYER HAS LIVES
        if (player.canExplode) {
            explosion.playbackRate = 8
            explosion.play()
            ctx.drawImage(smokeImage, player.x, player.y, 60, 60)

            //MAKES SMOKE DISAPPEAR
            setTimeout(() => {
                socket.emit('disableExplosion', {
                    playerId: player.id
                })
            }, 500)
        }

        //WHEN PLAY HAS 0 LIVES, DRAW FIRE IMAGE
        if (player.dead) {
            ctx.drawImage(fireImage, player.x, player.y, 40, 40)
            // if (!musicPlaying) {
            //     draconusAudio.play()
            //     switchButton.innerText = 'Music On'
            //     musicPlaying = !musicPlaying
            // }
        }
    }



    for (const shot of shots) {
        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = 'gray';
        ctx.fillStyle = 'gray'
        ctx.arc(shot.x, shot.y, 3, 0, 2 * Math.PI)
        ctx.fill();

        // cannonSound.playbackRate = 5
        // cannonSound.play()

    }

    for (const plane of airplanes) {
        const airplaneImage = new Image()
        // CHOOSE FILE THAT CORRESPONDS TO THE DIRECTION OF FLIGHT
        airplaneImage.src = plane.startSide === 'left' ? '/f22right.png' : '/f22left.png'
        ctx.drawImage(airplaneImage, plane.x, plane.y, 65, 65)


    }

    for (const life of lives) {
        // alert(life.x)
        ctx.drawImage(lifeImage, life.x, life.y, 30, 30)
    }
    window.requestAnimationFrame(loop)
}

window.requestAnimationFrame(loop)