let rom
let vm = new Chip8()



let UI = {
    info:   document.getElementById('info'),
    canvas: document.getElementById('screen'),
    ctx:    document.getElementById('screen').getContext('2d'),
    assembly: document.getElementById('assembly'),
    step1: document.getElementById('step-1'),
    step10: document.getElementById('step-10'),
    play: document.getElementById('play'),
    halt: document.getElementById('halt'),
    keypad: document.getElementById('keypad'),
    fileSelect: document.getElementById('file'),
    reset: document.getElementById('reset')
}

UI.canvas.width = 64 * 10
UI.canvas.height = 32 * 10

UI.reset.onclick = () => {
    init()
}

UI.fileSelect.onchange = (event) => {
    let file = event.target.files[0]
    let reader = new FileReader
    reader.onload = (event) => {
        console.log(event.target.result)
        rom = event.target.result
        window.cancelAnimationFrame(_loop)
        init()
    }

    reader.readAsArrayBuffer(file)
}

UI.step1.onclick = () => {
   vm.halt = true
   vm.cycle()
   drawScreen(UI.ctx, vm.pixels)
   UI.info.innerText = vmInfo(vm)
}

UI.step10.onclick = () => {
    vm.halt = true
    for (let k = 0; k < 10; k++){
        vm.cycle()
    }
}

UI.play.onclick = () => {
    vm.halt = false
    loop()
}

UI.halt.onclick = () => {
    vm.halt = true
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

        console.log(key)

    }

    document.onkeyup = (event) => {

        let key = String.fromCharCode(event.keyCode)
        let index = key_mapping[key]
        vm.input[index] = 0

    }

    UI.keypad.innerHTML = ""

    for (let i = 0; i < 16; i++){
        let btn = document.createElement('button')
        btn.innerText = i.toString(16)

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


function init(){
    vm.reset()
    vm.load(rom)
    UI.assembly.innerHTML = '<pre>' + dissassemble(rom) + '</pre>'
    initKeypad()
    loop()
}

let _loop

function loop(){
  
    for (let i = 0; i < 16; i++){ 
        vm.cycle()
    }
    if (vm.dt > 0){ vm.dt -= 1 }
    
    drawScreen(UI.ctx, vm)
    UI.info.innerText = vmInfo(vm)

    if (!vm.halt){
        _loop = window.requestAnimationFrame(loop)
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

function vmInfo(vm){
    return  `PC: ${hexFmt(vm.pc,4)} \n 
             REG:\n ----- \n ${Array.from(vm.regs).map((x,i) => 'V' + i.toString(16) + ": " + x.toString(16) ).join('\n')} 
             STACK:\n ----- \n ${Array.from(vm.stack).map((x,i) =>  i.toString(16) + ": " + x.toString(16) ).join('\n')} 
             VI: ${hexFmt(vm.reg_I,2)} \n
             DT: ${vm.dt} 
             ST: ${vm.st}
            `
}


