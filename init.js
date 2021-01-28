function parseDefinitions() {
    let def = new Object()
    let definitionsRaw = fs.readFileSync('12202020-JEUXDEMOTS-DEFS.txt', 'latin1')
    let tab = definitionsRaw.split("\n");

    for (let i = 3; i < tab.length - 2; i++) {
        let line = tab[i].split("|")
        if (line.length == 3) {
            if (!def.hasOwnProperty(line[1])) {
                def[line[1]] = []
            }
            let formated_def = line[2].substring(1, line[2].length - 2)
            def[line[1]].push(formated_def)
        }
        if(i%100 == 0){
            console.log("Parsing definitions: " + i + "/" + tab.length)
        }
    }

    return def
}

function parseAutocompleteMots() {
    let mots = []
    let motsRaw = fs.readFileSync('12012020-LEXICALNET-JEUXDEMOTS-ENTRIES.txt', 'latin1').toString()
    let tab = motsRaw.split("\n")

    for (let i = 12; i < tab.length - 1; i++) {
        let line = tab[i].split(";")
        if (line.length == 4) {
            mots.push(line[2])
        } else {
            mots.push(line[1])
        }
        if(i%100 == 0){
            console.log("Parsing entries: " + i + "/" + tab.length)
        }
    }

    return mots
}

var mots = serveur.parseAutocompleteMots()
fs.writeFileSync("autocomplete_mots.json", JSON.stringify(mots))

var def = serveur.parseDefinitions()
fs.writeFileSync("definitions.json", JSON.stringify(def))

