import os
import json

romData = {}

for filename in os.listdir('./Chip-8 Games'):
    if filename.endswith('.ch8'):
        romData["./Chip-8 Games/" + filename.split('.')[0]] = {
                                'name': filename.split('.')[0],
                                'file': 'Chip-8 Games/' + filename,
                                'sys': 'ch8',
                                'description':""
                            }
    if filename.endswith('.txt'):
        with open('./Chip-8 Games/' + filename) as f:
            romData["./Chip-8 Games/" + filename.split('.')[0]]['description'] = f.read()


for filename in os.listdir('./SuperChip Games'):
    if filename.endswith('.ch8'):
        romData["./SuperChip Games/" + filename.split('.')[0]] = {
                                'name': filename.split('.')[0],
                                'file': './SuperChip Games/' + filename,
                                'sys': 'sch8',
                                'description':""
                            }
    if filename.endswith('.txt'):
        with open('./SuperChip Games/' + filename) as f:
            romData["./SuperChip Games/" + filename.split('.')[0]]['description'] = f.read()




with open('roms.json', 'w') as f:
    json.dump(romData,f)