//generates json file of roms

const fs = require('fs')


fs.readdir('./', (err,files) => {
    let romJson = []

    files.forEach(file => {
        
        let name = file.split('.')[0]
        let ext = file.split('.')[1]
       
        if (['sch8', 'ch8'].includes(ext)){
            romJson.push({
                name:name,
                sys:ext
            })
        }

    })

    fs.writeFile('./_roms.json', JSON.stringify(romJson), () => {})

    console.log(romJson)
})