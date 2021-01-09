const express = require('express')
const http = require('http')
const app = express()
const iconv = require("iconv-lite");
const cors = require('cors')
const fs = require('fs');
const { WSAECONNREFUSED } = require('constants');
const port = 3000

app.use(cors())

var cache_index = loadCacheIndex();

console.log('cache loaded')
console.log(cache_index.length)

//fs.writeFileSync("definitions.json", JSON.stringify(parseDefinitions()))

var definitions = loadDefinitions()

console.log('definitions loaded')
console.log(Object.keys(definitions).length)

/*
var mots = parseAutocompleteMots()
fs.writeFileSync("autocomplete_mots.json", JSON.stringify(mots))
*/
var autocomplete_mots = JSON.parse(fs.readFileSync('autocomplete_mots.json'))

console.log('autocomplete_mots loaded')
console.log(autocomplete_mots.length)




//implémenter cache

app.get('/chercher-mot/', (req, res) => {
    //http://localhost:3000/chercher-mot/?motField=chien

    let motQuery = req.query.motField
    let mot = motQuery.replace(/>/g, '_')
    let rawData = ''

    //if(mot) $x r_isa chien
    //Rex r_isa $x

    let splittedMot = mot.split(" ");
    if(mot.includes("$") && splittedMot.length == 3){
        let s = -1
        let p = -1
        let o = -1
        let variable = -1
        if(splittedMot[0][0] == '$'){
            variable = 0
            s = splittedMot[0].split('$')[1]
            p = splittedMot[1]
            o = splittedMot[2]
            motQuery = o
        }else if(splittedMot[1][0] == '$'){
            variable = 1
            s = splittedMot[0]
            p = splittedMot[1].split('$')[1]
            o = splittedMot[2]
            motQuery = s 
        }else if(splittedMot[2][0] == '$'){
            variable = 2
            s = splittedMot[0]
            p = splittedMot[1]
            o = splittedMot[2].split('$')[1]
            motQuery = s 
        }

        http.get("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel=" + escape(motQuery) + "&rel=", (resAPI) => {

            //console.log('statusCode:', res.statusCode);
            //console.log('headers:', res.headers);

            resAPI.on('data', (chunk) => {
                str = iconv.decode(chunk, "ISO-8859-1");
                rawData += str
            });

            resAPI.on('end', () => {
                try {
                    splitData = rawData.split('<CODE>')
                    if (splitData.length == 1) {
                        res.json({ data: "Le terme '" + mot + "' n'existe pas dans la base de données." })
                    } else {
                        rawDump = splitData[1].split('</CODE>')[0]
                        dump = parseDump(rawDump)
                        dump.relationsTriees = new Object()
                        for (let l of dump.relationsTypes) {
                            dump.relationsTriees[l[3]] = genererArrayRelation(l[2], dump)
                        }
                        addToCache(mot, dump)
                        let obj = new Object()
                        obj.relationsTriees = dump.relationsTriees

                        //reutilisons s o et p
                        let liste_results = []
                        if(variable == 0){
                            let nom_relation = "";
                            for(let type of dump.relationsTypes){
                                if(type[2] == p){
                                    nom_relation = type[3];
                                }
                            }
                            let sendObj = new Object();
                            sendObj.listeMots = obj.relationsTriees[nom_relation]['entrantes']
                            sendObj.requete = splittedMot
                            res.send(sendObj);
                        }
                    }
                } catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(e);
        });

    }else if (cache_index.includes(mot + '.json')) {
        rawData = fs.readFileSync('./cache/' + mot + '.json')
        dump = JSON.parse(rawData)
        let obj = new Object()
        obj.eid = dump.eid
        obj.definitions = getDefinitions(dump.eid)
        obj.relationsTriees = dump.relationsTriees
        res.send(obj)
    } else {
        http.get("http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel=" + escape(motQuery) + "&rel=", (resAPI) => {

            //console.log('statusCode:', res.statusCode);
            //console.log('headers:', res.headers);

            resAPI.on('data', (chunk) => {
                str = iconv.decode(chunk, "ISO-8859-1");
                rawData += str
            });

            resAPI.on('end', () => {
                try {
                    splitData = rawData.split('<CODE>')
                    if (splitData.length == 1) {
                        res.json({ data: "Le terme '" + mot + "' n'existe pas dans la base de données." })
                    } else {
                        rawDump = splitData[1].split('</CODE>')[0]
                        dump = parseDump(rawDump)
                        dump.relationsTriees = new Object()
                        for (let l of dump.relationsTypes) {
                            dump.relationsTriees[l[3]] = genererArrayRelation(l[2], dump)
                        }
                        addToCache(mot, dump)
                        let obj = new Object()
                        obj.relationsTriees = dump.relationsTriees

                        // let jsonPoids = []
                        // for(let reltype in obj.relationsTriees){
                        //     for(r of obj.relationsTriees[reltype]){
                        //         jsonPoids.push(parseInt(r[5]))
                        //     }
                        // }
                        // fs.writeFile('./cache/jsonPoids.json', JSON.stringify(jsonPoids), (err) => { if (err) throw err; })

                        obj.eid = dump.eid

                        obj.definitions = getDefinitions(dump.eid)

                        console.log("api request")

                        res.send(obj)
                    }
                } catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(e);
        });
    }
})

app.get('/autocomplete-mot/', (req, res) => {

    //ordre:
    //text+1x
    //text+?x
    //str.indexOf(text)>=0
    //distance de levenstein


    let text = req.query.motField
    let tab10 = []
    let matches = matching(text)

    if (matches.length <= 10) {
        res.send(matches)
        return
    }

    let max_string_length = matches.sort((a, b) => b.length - a.length)[0].length
    let sugg_length = text.length

    while (tab10.length < 10) {
        let found = false
        for (let word of matches) {
            if (!tab10.includes(word)) {
                if (word.length == sugg_length && word.startsWith(text)) {
                    tab10.push(word)
                    if (tab10.length == 10) {
                        break
                    }
                    found = true
                }
            }
        }
        if (!found) {
            sugg_length += 1
            if (sugg_length > max_string_length) {
                break
            }
        }
    }

    sugg_length = text.length + 1
    while (tab10.length < 10) {
        let found = false
        for (let word of matches) {
            if (!tab10.includes(word)) {
                if (word.length == sugg_length) {
                    tab10.push(word)
                    if (tab10.length == 10) {
                        break
                    }
                    found = true
                }
            }
        }
        if (!found) {
            sugg_length += 1
            if (sugg_length > max_string_length) {
                break
            }
        }
    }

    res.send(tab10)
})

function matching(text) {
    //preloader pour tous les mots de 3 lettres ou moins
    return autocomplete_mots.filter((str) => {
        if (str === null) {
            return false
        }
        return str.indexOf(text) >= 0;
    });
}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

function getDefinitions(eid) {
    return definitions[eid]
}

function loadCacheIndex() {
    return fs.readdirSync('./cache/')
}

function addToCache(mot, dump) {
    cache_index.push(mot + '.json')
    fs.writeFile('./cache/' + mot + '.json', JSON.stringify(dump), (err) => { if (err) throw err; })
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
    }

    return mots
}

function loadDefinitions() {
    return JSON.parse(fs.readFileSync('definitions.json'))
}

function parseDefinitions() {
    let def = new Object()
    let definitionsRaw = fs.readFileSync('12022020-JEUXDEMOTS-DEFS.txt', 'latin1')
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
    }

    return def
}

function parseDump(rawDump) {
    let tab = rawDump.split("\n");

    let dumpObject = new Object();

    dumpObject.definitions = []
    dumpObject.nodesTypes = []
    dumpObject.entries = []
    dumpObject.relationsTypes = []
    dumpObject.relationsSortantes = []
    dumpObject.relationsEntrantes = []

    for (let i = 0; i < tab.length; i++) {
        if (tab[i].includes('(eid=')) {
            dumpObject.eid = tab[i].split('(eid=')[1].split(')')[0]
        } else if (tab[i].includes("<def>")) {
            i += 2
            while (tab[i] != "</def>") {
                dumpObject.definitions.push(tab[i].replace("<br />", ""))
                i = i + 1
            }
        } else if (tab[i].includes("// les types de noeuds (Nodes Types) : nt;ntid;'ntname'")) {
            i += 2
            while (tab[i] != "") {
                let t = tab[i].split(";")
                t[2] = t[2].substring(1, t[2].length - 1)
                dumpObject.nodesTypes.push(t)
                i = i + 1
            }
        } else if (tab[i].includes("// les noeuds/termes (Entries) : e;eid;'name';type;w;'formated name'")) {
            i += 2
            while (tab[i] != "") {
                let t = tab[i].split(";")
                t[2] = t[2].substring(1, t[2].length - 1)
                if (t.length == 6) {
                    t[5] = t[5].substring(1, t[5].length - 1)
                }
                dumpObject.entries.push(t)
                i = i + 1
            }
        } else if (tab[i].includes("// les types de relations (Relation Types) : rt;rtid;'trname';'trgpname';'rthelp'")) {
            i += 2
            while (tab[i] != "") {
                let t = tab[i].split(";")
                t[2] = t[2].substring(1, t[2].length - 1)
                t[3] = t[3].substring(1, t[3].length - 1)
                dumpObject.relationsTypes.push(t)
                i = i + 1
            }
        } else if (tab[i].includes("// les relations sortantes : r;rid;node1;node2;type;w")) {
            i += 2
            while (tab[i] != "") {
                dumpObject.relationsSortantes.push(tab[i].split(";"))
                i = i + 1
            }
        } else if (tab[i].includes("// les relations entrantes : r;rid;node1;node2;type;w")) {
            i += 2
            while (tab[i] != "") {
                dumpObject.relationsEntrantes.push(tab[i].split(";"))
                i = i + 1
            }
        }
    }

    return dumpObject
}

function genererArrayRelation(r_type, dumpObject) {
    let arrayRelation = new Object()
    arrayRelation.entrantes = []
    arrayRelation.sortantes = []
    let idRelation = getIdRelation(r_type, dumpObject)
    for (let l of dumpObject.relationsSortantes) {
        if (l[4] == idRelation) {
            let termeInfo = getTermeInfo(l[3], dumpObject)
            let relationInfo = l
            relationInfo[3] = termeInfo
            arrayRelation.sortantes.push(relationInfo)
        }
    }
    for (let l of dumpObject.relationsEntrantes) {
        if (l[4] == idRelation) {
            let termeInfo = getTermeInfo(l[2], dumpObject)
            let relationInfo = l
            relationInfo[2] = termeInfo
            arrayRelation.entrantes.push(relationInfo)
        }
    }
    arrayRelation.sortantes.sort((a, b) => b[5] - a[5])
    arrayRelation.entrantes.sort((a, b) => b[5] - a[5])
    return arrayRelation
}

function getTermeInfo(termeId, dumpObject) {
    for (let l of dumpObject.entries) {
        if (l[1] == termeId) {
            return l
        }
    }
}

function getIdRelation(r_type, dumpObject) {
    for (let l of dumpObject.relationsTypes) {
        if (l[2] == r_type) {
            return l[1]
        }
    }
    return -1
}