let font = [
    0xF0, 0x90, 0x90, 0x90, 0xF0,
    0x20, 0x60, 0x20, 0x20, 0x70,
    0xF0, 0x10, 0xF0, 0x80, 0xF0,
    0xF0, 0x10, 0xF0, 0x10, 0xF0,
    0x90, 0x90, 0xF0, 0x10, 0x10,
    0xF0, 0x80, 0xF0, 0x10, 0xF0,
    0xF0, 0x80, 0xF0, 0x90, 0xF0,
    0xF0, 0x10, 0x20, 0x40, 0x40,
    0xF0, 0x90, 0xF0, 0x90, 0xF0,
    0xF0, 0x90, 0xF0, 0x10, 0xF0,
    0xF0, 0x90, 0xF0, 0x90, 0x90,
    0xE0, 0x90, 0xE0, 0x90, 0xE0,
    0xF0, 0x80, 0x80, 0x80, 0xF0,
    0xE0, 0x90, 0x90, 0x90, 0xE0,
    0xF0, 0x80, 0xF0, 0x80, 0xF0,
    0xF0, 0x80, 0xF0, 0x80, 0x80,

    0xFF, 0xFF, 0xC3, 0xC3, 0xC3, 0xC3, 0xC3, 0xC3, 0xFF, 0xFF, 0x18, 0x78, 0x78, 0x18, 0x18, 0x18    
    ,0x18,0x18 ,0xFF ,0xFF ,0xFF ,0xFF ,0x03 ,0x03 ,0xFF ,0xFF ,0xC0 ,0xC0 ,0xFF ,0xFF ,0xFF ,0xFF   
    ,0x03 ,0x03 ,0xFF ,0xFF ,0x03 ,0x03 ,0xFF ,0xFF ,0xC3 ,0xC3 ,0xC3 ,0xC3 ,0xFF ,0xFF ,0x03 ,0x03    
    ,0x03 ,0x03 ,0xFF ,0xFF ,0xC0 ,0xC0 ,0xFF ,0xFF ,0x03 ,0x03 ,0xFF ,0xFF ,0xFF ,0xFF ,0xC0 ,0xC0   
    ,0xFF ,0xFF ,0xC3 ,0xC3 ,0xFF ,0xFF ,0xFF ,0xFF ,0x03 ,0x03 ,0x06 ,0x0C ,0x18 ,0x18 ,0x18 ,0x18    
    ,0xFF ,0xFF ,0xC3 ,0xC3 ,0xFF ,0xFF ,0xC3 ,0xC3 ,0xFF ,0xFF ,0xFF ,0xFF ,0xC3 ,0xC3 ,0xFF ,0xFF   
    ,0x03 ,0x03 ,0xFF ,0xFF ,0x7E ,0xFF ,0xC3 ,0xC3 ,0xC3 ,0xFF ,0xFF ,0xC3 ,0xC3 ,0xC3 ,0xFC ,0xFC    
    ,0xC3 ,0xC3 ,0xFC ,0xFC ,0xC3 ,0xC3 ,0xFC ,0xFC ,0x3C ,0xFF ,0xC3 ,0xC0 ,0xC0 ,0xC0 ,0xC0 ,0xC3   
    ,0xFF ,0x3C ,0xFC ,0xFE ,0xC3 ,0xC3 ,0xC3 ,0xC3 ,0xC3 ,0xC3 ,0xFE ,0xFC ,0xFF ,0xFF ,0xC0 ,0xC0    
    ,0xFF ,0xFF ,0xC0 ,0xC0 ,0xFF ,0xFF ,0xFF ,0xFF ,0xC0 ,0xC0 ,0xFF ,0xFF ,0xC0 ,0xC0 ,0xC0 ,0xC0  

]



class Chip8 {
    constructor(){
        this.reset()
    }

    reset(){

        this.pc = 0x200 //program counter
        
        this.mem = new Uint8Array(4096) //Memory
        this.regs = new Uint8Array(16)  //Registers
        this.reg_I = 0 //I register

        this.stack = new Uint16Array(16) //stack
        this.sp = 0 //stack pointer

        this.dt = 0 //delay timer
        this.st = 0 //sound timer

        this.pixels = [] //display
        
        for (let i = 0; i < 128; i++){
            this.pixels.push(new Array(64).fill(0))
        }

        this.input = new Uint16Array(16)


        this.extendedMode = false // flag full-screen graphics mode (Super Chip-8)
        this.userFlags = new Uint16Array(16) // user flags (Super Chip-8)

        this.halt = false

        //load font sprites 
        let font_arr = new Uint8Array(font)

        for (let i = 0; i < font_arr.length;i++){
            this.mem[i] = font_arr[i]
        }
    }

    load(buffer){
        let data = new Uint8Array(buffer)
        for (let i = 0; i < data.length; i++){
            this.mem[i + 512] = data[i]
        }

        
        console.log(hexdump(this.mem))
    
    }

    cycle(){

        let upper = this.mem[this.pc]
        let lower = this.mem[this.pc + 1]

        let op = (upper >>> 4) //first four bits of upper
        let x = (upper & 0xF) //bottom four bits of upper
        let y = (lower >>> 4) //first four bits of upper, register address
        let n = (lower & 0xF) //bottom four bits of lower, register address
        let nnn = ((upper & 0xF) << 8) | lower //bottom 12 bits, memory address

      
       switch(op) {
            case 0:
                if (y ==0xC){ //SCRL n scroll n lines down
                    console.log('scroll', n)
                    for (let x = 0; x < 128; x++){
                        for (let y = 63; y > 0; y--){
                            this.pixels[x][y] = this.pixels[x][y - 1]
                        }
                    }

                    for (let x = 0; x < 128; x++){
                        this.pixels[x][0] = 0
                    }
                    break;
                }

                switch(lower){
                    case 0xE0: //CLS Clear Screen
                        for (let x = 0; x < 64; x++){
                            for (let y = 0; y < 32; y++){
                                this.pixels[x][y] = 0
                            }
                        }
                    break;

                    case 0xEE: //RET Return from subroutine
                        this.sp -= 1
                        this.pc = this.stack[this.sp]
                    break;

                

                    case 0xFE: //EMD Disable extended mode
                        this.extendedMode = false
                    break;

                    case 0xFF: //EME Enable extended mode
                        this.extendedMode = true
                    break;

                    default:
                        
                        console.error("Instruction", hexFmt(upper,2) + hexFmt(lower,2), "not found")
                        vm.halt = true
                        return
                }
            break;

            case 1: //JP addr Jump progam to address nnn
                this.pc = nnn
                return
            break;

            case 2: // Call addr Push pc to stack, jump to subroutine @ nnn,
                
                this.stack[this.sp] = this.pc
                this.sp += 1 
                this.pc = nnn
                return
            break;

            case 3: //SE Vx, byte if Vx == lower, skip next instruction
                if (this.regs[x] == lower){
                    this.pc += 2
                }
            break;

            case 4: //SNE Vx, byte if Vx != lower, skip next instruction
                if (this.regs[x] != lower){
                    this.pc += 2
                }
            break;

            case 5: //SE vx,vy if vx == vy, skip next instruction
                if (this.regs[x] == this.regs[y]){
                    this.pc += 2
                }
            break;

            case 6: //LD Vx, btye set Vx to lower
                this.regs[x] = lower
            break;

            case 7: //Add Vx,byte Vx = Vx + lower 
                this.regs[x] = this.regs[x] + lower
            break;

            case 8:
                switch(n){
                    case 0: //LD Vx, Vy set Vx = Vy
                        this.regs[x] = this.regs[y]
                    break

                    case 1: //Or Vx, Vy set Vx = Vx or Vy
                        this.regs[x] = this.regs[x] | this.regs[y]
                    break

                    case 2: //And Vx, Vy set Vx = Vx and Vy
                        this.regs[x] = this.regs[x] & this.regs[y]
                    break

                    case 3: //Xor Vx, Vy set Vx = Vx xor Vy
                        this.regs[x] = this.regs[x] ^ this.regs[y]
                    break

                    case 4: // Add Vx, Vy set Vx = Vx + Vy, if overflow (>255) set Vf to 1, else set V2 to zero
                        let result = (this.regs[x] + this.regs[y])
                    
                        if (result > 255){
                            this.regs[0xF] = 1
                        } else {
                            this.regs[0xF] = 0
                        }
                        this.regs[x] = result //since this.regs it typed array, result will be mod 256
                    break

                    case 5://SUB Vx, Vy Vx = Vx - Vy, if Vx > Vy, VF = is set to 1, else set to 0
                        if ( this.regs[x] >= this.regs[y]){
                            this.regs[0xF] = 1
                        } else {
                            this.regs[0xF] = 0
                        }
                        this.regs[x] = this.regs[x] - this.regs[y]
                        
                    break

                    case 6: // SHR Vx set Vf to least signifcant byte of Vx, divide Vx by 2 (Vx >> 1)
                        this.regs[0xF] = this.regs[x] & 1
                        this.regs[x] = this.regs[x] >>> 1
                    break

                    case 7://SUBN Vx, Vy Vx = Vy - Vx if Vy > Vx, VF = is set to 1, else set to 0
                        if ( this.regs[y] >= this.regs[x]){
                            this.regs[0xF] = 1
                        } else {
                            this.regs[0xF] = 0
                        }
                        this.regs[x] = this.regs[y] - this.regs[x]
                    break

                    case 0xE: // SHL Vx set Vf to most signifcant bit of Vx, multiply Vx by 2 (Vx << 1)
                        this.regs[0xF] = this.regs[x] >>> 7
                        this.regs[x] = this.regs[x] << 1
                    break

                    default:
                        console.error("Instruction", hexFmt(upper,2) + hexFmt(lower,2), "not found")
                        this.halt = true
                        return                    
                }
            break;

            case 9:// SNE Vx, Vy Skip next intruction if Vx != Vy
                if (this.regs[x] != this.regs[y]){
                    this.pc += 2
                }
            break;
            
            case 0xA: // LD I, addr set register I to nnn
                this.reg_I = nnn
            break;

            case 0xB: // JP V0, addr Jump to location v0 + nn
                this.pc = this.regs[0] + nnn
                return
            break;

            case 0xC: // RND Vx, byte  Vx to rand and lower
                let rand = Math.floor(Math.random() * 256)
                this.regs[x] = rand & lower
            break;

            case 0xD: //DRW Vx, Vy, nibble Daw n byte sprite @ Vx, Vy cords

                this.regs[0xF] = 0

               let height = (n == 0)?16:n
               let width = (n == 0)?16: 8

                for (let offset = 0; offset < height; offset++){
                    for (let i = 0; i < width; i++){
                        let _x = (this.regs[x] + i) % ((this.extendedMode) ? 128 : 64)
                        let _y = (this.regs[y] + offset) % ((this.extendedMode) ? 64 : 32)
                        let prev = this.pixels[_x][_y]
                        this.pixels[_x][_y] = ((this.mem[this.reg_I + offset] >>> (7 - i)) & 1) ^ this.pixels[_x][_y]
                        
                        if (prev > this.pixels[_x][_y]){
                            this.regs[0xF] = this.regs[0xF] | 1
                        }
                    }
                }

            break;

            case 0xE:
                switch (lower){
                    case 0x9E: //SKP Vx next instruction if Val of Vx is pressed
                        if (this.input[this.regs[x]] == 1){
                            this.pc += 2
                        }
                    break;

                    case 0xA1: //SKP Vx next instruction if Val of Vx not pressed
                        if (this.input[this.regs[x]] == 0){
                            this.pc += 2
                        }
                    break;

                    default:
                        console.error("Instruction", hexFmt(upper,2) + hexFmt(lower,2), "not found")
                        this.halt = true
                        return  
                }
            
            break;

            case 0xF:
                switch(lower) {

                    case 0x07: // LD vx, DT, set dv = to deltat timer
                        this.regs[x] = this.dt
                    break;

                    case 0xA: // LD Vx, K Wait for a key press, store the value of the key in Vx.
                        for (let i = 0; i < 16; i++){
                            if (this.input[i] == 1){
                                this.regs[x] = i 
                                this.input[i] = 0
                                this.pc += 2
                            }
                        }
                        return
                    break;


                    case 0x15: // LD Dt, Vx set delay timer to vx
                        this.dt = this.regs[x]
                    break;

                    case 0x18: // LD ST, Vx Set sound timer = Vx.
                       this.st = this.regs[x]
                    break;
                

                    case 0x1E: 
                        this.reg_I = this.reg_I + this.regs[x]
                        if (this.reg_I > 0xFFF) {
                            this.regs[0xF] = 1
                            this.regs_I = this.reg_I & 0xFFF
                        } else {
                            this.regs[0xF] = 0
                        }
                    break;

                    case 0x29: // LD F, Vx Set I = location of sprite for digit Vx.
                        this.reg_I = (this.regs[x]) * 5 
                    break;

                    case 0x30: // LD F, Vx Set I = location of sprite for digit Vx. (10 byte version)
                        this.reg_I = ((this.regs[x]) * 10) + 0x50 
                        console.log(((this.regs[x]) * 10) + 0x50)
                    break;

                    
                    case 0x33: // LD B, Vx Store BCD representation of Vx in memory locations I, I+1, and I+2.
                        let num = this.regs[x]
                        let hunds = Math.floor(num / 100)
                        num -= 100 * hunds
                        let tens = Math.floor(num/10)
                        num -= 10 * tens
                        let ones = num

                        this.mem[this.reg_I] = hunds
                        this.mem[this.reg_I + 1] = tens
                        this.mem[this.reg_I + 2] = ones  
                    break;

                    case 0x55: // LD [I], Vx Store registers V0 through Vx in memory starting at location I.
                        for (let i = 0; i <= x; i++){
                            this.mem[this.reg_I + i] = this.regs[i]
                        }
                    break;

                    case 0x65: // LD Vx, [I]  Read registers V0 through Vx from memory starting at location I.
                        for (let i = 0; i <= x; i++){
                            this.regs[i] = this.mem[this.reg_I + i]
                        }
                
                    break;

                    case 0x75: 
                        for (let i = 0; i <= x; i++){
                            this.userFlags[i] = this.regs[i]
                        }
                
                    break;

                    case 0x85: 
                        for (let i = 0; i <= x; i++){
                            this.regs[i] = this.userFlags[i] 
                        }
                
                    break;

                    default:
                        console.error("Instruction", hexFmt(upper,2) + hexFmt(lower,2), "not found")
                        this.halt = true
                        return

                }
            break;

           default:
                console.log(hexFmt(this.pc, 3),hexFmt(upper,2) + hexFmt(lower,2), 'not executed')
                this.halt = true
                return
              
       }

       this.pc += 2
    }

    logScreen(){
        let str = ""
        for (let y = 0; y < 32; y++){
            for (let x = 0; x < 64; x++){
                str += (this.pixels[x][y] > 0) ? "\u2B1B" : "\u2B1C"
                //str += this.pixels[x][y] + " "
            }
            str += '\n'
        }
        return str
    }
  
}





function hexdump(buffer){
    let data = new Uint8Array(buffer)
    
    let str = "  Offset: 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F\n"

    for (let i = 0; i < data.length; i++){
        if (i % 16 == 0) {
            str += '\n' + i.toString(16).toUpperCase().padStart(8,"0") + ": " 
        }
        str += (data[i].toString(16).toUpperCase().padStart(2, '0')) + " "
    }
    return str
}


function dissassemble(buffer){
    let data = new Uint8Array(buffer)
    let output = ""

    for (let i = 0; i < data.length - 1; i += 2){
     
        let upper = data[i]
        let lower = data[i+1]

        let op = (upper >>> 4) //first four bits of upper
        let x = (upper & 0x0F) //bottom four bits of upper
        let y = (lower >>> 4) //first four bits of upper, register address
        let n = (lower & 0x0F) //bottom four bits of lower, register address
        let nnn = ((upper & 0xF) << 8) | lower //bottom 12 bits, memory address

        output += (i + 512).toString(16).padStart(4,' ') + ": " + hexFmt(upper,2) + hexFmt(lower,2) + "- "
    
       switch(op) {
            case 0:
                if (lower == 0xE0){
                    output += 'CLS '
                } else if (lower == 0xEE){
                    output += 'RET '
                }
            break;

            case 1:
                output += 'JMP ' + hexFmt(nnn, 3) 
            break;

            case 2:
                output += 'CALL ' + hexFmt(nnn, 3) 
            break;

            case 3:
                output += 'SE ' + 'V' + hexFmt(x, 1) + " " + hexFmt(lower, 2)
            break;

            case 6:
                output += 'LD ' + 'V' + hexFmt(x, 1) + " " + hexFmt(lower,2) 
            break;

            case 7:
                output += 'ADD ' + 'V' + hexFmt(x, 1) + " " + hexFmt(lower,2) 
            break;

            case 0xA:
                output += 'LD ' + 'I ' + hexFmt(nnn, 3)
            break;

            case 0xC:
                output += 'RND ' + 'X' + hexFmt(x, 1) + " " + hexFmt(lower, 2)
            break;

            case 0xD:
                output += 'DRW ' + 'V' + hexFmt(x, 1) + ' V' + hexFmt(x, 1) + " " + hexFmt(n, 1)
            break;

            case 0xE:
                if (lower == 0x9E){
                    output += "SKP " + 'V' + hexFmt(x, 1)
                }

                if (lower == 0xA1){
                    output += "SKNP " + 'V' + hexFmt(x, 1)
                }
            
            break;

            case 0xF:
                switch(lower) {
                    case 0x07:
                    output += 'LD ' + 'V' + hexFmt(x, 1) + ' DT'
                    break;

                    case 0x0A:
                    break;

                    case 0x15:
                        output += 'LD DT ' + 'V' + hexFmt(x, 1) 
                    break;

                    case 0x18:
                    break;

                    case 0x1E:
                    break;

                    case 0x29:
                    break;

                    case 0x33:
                        output += 'LD B ' + 'V' + hexFmt(x, 1) 
                    break;

                    case 0x55:
                    break;

                    case 0x65:
                    break;
                }
            break;

           default:
              
       }

       output += '\n'
                    
    }

    return output
}

function hexFmt(d, p){
    return d.toString(16).toUpperCase().padStart(p,'0')
}
