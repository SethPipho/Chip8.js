let vm = new Chip8()
vm.halt = true

let app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      roms:[],
      selectedRom:'',
      clockSpeed:500,
      romFile:'Select File',
      rom:'',
      keyMappings:{
            '1':0,
            '2':1,
            '3':2,
            '4':3,
            'Q':4,
            'W':5,
            'E':6,
            'R':7,
            'A':8,
            'S':9,
            'D':10,
            'F':11,
            'Z':12,
            'X':13,
            'C':14,
            'V':15,
        }
    },

    methods:{

        keyPadUp: function(i){
            vm.input[i] = 0
        },

        keyPadDown: function(i){
            vm.input[i] = 1
        },

        reset:function(){
            vm.reset()
            vm.load(this.rom)
        },

        changeRom:function(){
            fetch('./roms/' + this.selectedRom.file)
                .then((res) => res.arrayBuffer())
                .then((buffer) => {
                    this.rom = buffer
                    vm.reset()
                    vm.load(buffer)

                    if (this.selectedRom.sys == "ch8"){
                        this.clockSpeed = 500
                    } else {
                        this.clockSpeed = 1000
                    }

                    this.romFile = "Select File"
                })       

        },

        loadRomFromFile:function(event){
            let file = event.target.files[0]
            let reader = new FileReader
            reader.onload = (event) => {
                this.selectedRom = ""
                this.romFile = file.name
                
                rom = event.target.result
                this.rom = rom
                vm.reset()
                vm.load(rom)
            }
            reader.readAsArrayBuffer(file)

        }
    },


    mounted: function(){
        fetch('./roms/roms.json')
            .then((res) => res.json())
            .then((data) => {
                this.roms = data 
                this.selectedRom = this.roms['./Chip-8 Games/Pong (1 player)']
               
                this.changeRom()
            }) 
        
        document.onkeydown = (event) => {
            let key = String.fromCharCode(event.keyCode)
            let index = this.keyMappings[key]
            vm.input[index] = 1
        }
    
        document.onkeyup = (event) => {
            let key = String.fromCharCode(event.keyCode)
            let index = this.keyMappings[key]
            vm.input[index] = 0
        }
        
    }
  })



let canvas = document.getElementById('screen')
let ctx = canvas.getContext('2d')

canvas.width = 64 * 6
canvas.height = 32 * 6

let sound = new Audio('static/tone.wav')
sound.preload = true




function drawScreen(ctx, vm){
    let width = ctx.canvas.width
    let height = ctx.canvas.height

    let pixels_x = ((vm.extendedMode) ? 128:64)
    let pixels_y = ((vm.extendedMode) ? 64:32)
    
    let pixel_w = width / pixels_x
    let pixel_h = height/ pixels_y

    for (let x = 0; x < pixels_x; x++){
        for (let y = 0; y < pixels_y; y++){
            ctx.fillStyle = (vm.pixels[x][y] == 1)? "rgb(230,230,230)" : "rgb(60,60,60)"
            ctx.fillRect(x * pixel_w, y * pixel_h, pixel_w, pixel_w)
        }
    }
}



loop()

function loop(){

    if (!vm.halt){
            
        for (let i = 0; i < Math.round(app.clockSpeed/60); i++){ 
            vm.cycle()
        }
        if (vm.dt > 0){ vm.dt -= 1 }
        
        if (vm.st > 0){ 
            vm.st -= 1
            sound.play()
        } else {
            sound.pause()
            sound.currentTime = 0
        }
        drawScreen(ctx, vm)
    }
    window.requestAnimationFrame(loop)
}





