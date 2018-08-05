let vm = new Chip8()
vm.halt = true

let rom
let romList = []
let selectedRom = 33

let clk_speed = 500

let UI = {
    canvas: document.getElementById('screen'),
    ctx:    document.getElementById('screen').getContext('2d'),
    romSelect: document.getElementById('rom-select'),
    keypad: document.getElementById('keypad'),
    fileSelect: document.getElementById('file'),
    reset: document.getElementById('reset'),
    clkSpeed: document.getElementById('clk-speed'),
    fileText: document.getElementById('file-text')
    
}

initKeypad()

UI.canvas.width = 64 * 6
UI.canvas.height = 32 * 6

let sound = new Audio('static/tone.wav')
sound.preload = true

//load json file with list of availble roms
fetch('/roms/_roms.json')
    .then((res) => res.json())
    .then((data) => {
        
        data.forEach((d,i) => {
            let option = document.createElement('option')
            option.innerText = '[' + d.sys + '] ' + d.name
            UI.romSelect.appendChild(option)
        })
        romList = data
        UI.romSelect.selectedIndex = selectedRom


        loadRom()
    })

//load rom over network
function loadRom(){
    fetch('/roms/' + romList[UI.romSelect.selectedIndex].file)
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
            rom = buffer
            vm.reset()
            vm.load(rom)

            if (romList[UI.romSelect.selectedIndex].sys =="ch8"){
                clk_speed = 500
                UI.clkSpeed.selectedIndex = 0
            } else {
                clk_speed = 1000
                UI.clkSpeed.selectedIndex = 1
            }
        })       
}

UI.clkSpeed.onchange = () => {
   clk_speed = parseInt(UI.clkSpeed.value)
   console.log(clk_speed)
}

UI.romSelect.onchange = () => {
    UI.fileText.innerText = "Select File"
    loadRom()
}

UI.reset.onclick = () => {
   vm.reset()
   vm.load(rom)
}

UI.fileSelect.onchange = (event) => {
    let file = event.target.files[0]
    let reader = new FileReader
    reader.onload = (event) => {
        selectedRom = -1
        UI.romSelect.selectedIndex = -1
        UI.fileText.innerText  = file.name
        rom = event.target.result
        
        vm.reset()
        vm.load(rom)
    }
    reader.readAsArrayBuffer(file)
}


function initKeypad(){

    let key_mapping = {
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

    document.onkeydown = (event) => {
        let key = String.fromCharCode(event.keyCode)
        let index = key_mapping[key]
        vm.input[index] = 1
    }

    document.onkeyup = (event) => {
        let key = String.fromCharCode(event.keyCode)
        let index = key_mapping[key]
        vm.input[index] = 0
    }

    

    for (let i = 0; i < 16; i++){
        let btn = document.createElement('button')

        for (let letter in key_mapping){
            if (key_mapping[letter] == i){
                btn.innerText = i.toString(16) + "(" + letter + ")"
                break
            }
        }

        btn.onmousedown = () => {
            vm.input[i] = 1
        }

        btn.onmouseup = () => {
            vm.input[i] = 0
        }

        btn.onmouseleave = () => {
            vm.input[i] = 0
        }

        UI.keypad.appendChild(btn)
        if (i % 4 == 3){
            UI.keypad.appendChild(document.createElement('br'))
        }
    }
}


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
            
        for (let i = 0; i < Math.round(clk_speed/60); i++){ 
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
        drawScreen(UI.ctx, vm)
    }
    window.requestAnimationFrame(loop)
}





