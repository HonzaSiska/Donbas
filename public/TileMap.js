export default class TileMap {
    constructor(tileSize,ctx,cameraX, cameraY) {
        this.tileSize = tileSize;
        //   this.wall = this.#image("wall.png");
        //   this.pacman = this.#image("pacman.png");
        //   this.dot = this.#image("yellowDot.png");
        //   this.ghost = this.#image("ghost.png");

    }

    // #image(fileName) {
    //   const img = new Image();
    //   img.src = `images/${fileName}`;
    //   return img;
    // }

    //1 - wall
    //0 - dots
    //2 - pacman
    //3 enemies


    // map = [
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,1,1,1,0,1],
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,1,1,1,0,1],
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,1,1,1,0,1],
    //     [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0,0,0,0,0,1],
    //     [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,1,1,1,0,1],
    //     [1, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,1,1,1,0,1],
    //     [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,1,1,1,0,1],
    //     [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,1,1,1,0,1],
    //     [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1,1,1,1,0,1],
    //     [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1,1,1,1,0,1],
    //     [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1,1,1,1,0,1],
    //     [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,1,1,1,0,1],
    //     [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,1,1,1,0,1],
    //     [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,1,1,1,0,1],
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1,1,1,1,0,1],
    // ];
    // createMapArray(map){
    //     return map
    // }


    //Build a map
    map = []

    createMapArray(map){
        for(let column = 0 ;column < 20; column ++ ){
           let newRow = []
           for(let row = 0; row < 20; row ++){
                newRow.push( Math.floor(Math.random() * (4 - 0)) + 0)
           }
           this.map.push(newRow)
           
        }
    }
    

    draw(canvas, ctx) {
        
        
        this.#setCanvasSize(canvas);
        this.#clearCanvas(canvas, ctx);
        this.#drawMap(ctx);
    }

    #drawMap(ctx) {
       
        let color
        console.log('running')
        for (let row = 0; row < this.map.length; row++) {
            for (let column = 0; column < this.map[row].length; column++) {

                const tile = this.map[row][column];


                switch (tile) {
                    case 1:
                        color = '#b58456';
                        ctx.fillStyle = color
                        ctx.fillRect(column * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize)
                        break;
                    case 0:
                        color = '#f7e8d9';
                        ctx.fillStyle = color
                        ctx.fillRect(column * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize)

                        break;
                    case 2:

                        color = '#f7e8d9';
                        ctx.fillStyle = color
                        ctx.fillRect(column * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize)
                        color = '#33ff33';

                        ctx.beginPath();
                        ctx.lineWidth = "0";
                        ctx.strokeStyle = color;
                        ctx.fillStyle = color
                        ctx.arc(column * this.tileSize + 16, row * this.tileSize + 16, 16, 0, 2 * Math.PI)
                        ctx.fill();
                        // ctx.stroke()
                        break;
                    case 3:
                        color = '#f7e8d9';
                        ctx.fillStyle = color
                        ctx.fillRect(column * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize)


                        color = '#80bfff';
                        ctx.beginPath();
                        ctx.lineWidth = "0";
                        ctx.strokeStyle = color;
                        ctx.fillStyle = color
                        ctx.arc(column * this.tileSize + 16, row * this.tileSize + 16, 16, 0, 2 * Math.PI)
                        ctx.fill();
                        // ctx.stroke()
                        break;
                    default: 'red'
                }
              
            }
        }
    }

    #clearCanvas(canvas, ctx) {
         
        ctx.clearRect(0,0, canvas.width, canvas.height)
        // ctx.fillStyle = "#f7e8d9";
        // ctx.rect(0, 0, canvas.width, canvas.height);

    }

    #setCanvasSize(canvas) {
        canvas.height = this.map.length * this.tileSize  
        canvas.width = this.map[0].length * this.tileSize  
        // canvas.height = window.innerHeight 
        // canvas.width =  window.innerWidth
        
    }
}