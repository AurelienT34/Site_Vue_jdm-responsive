import * as serveur from 'serveur.js';

var mots = serveur.parseAutocompleteMots()
fs.writeFileSync("autocomplete_mots.json", JSON.stringify(mots))

var def = serveur.parseDefinitions()
fs.writeFileSync("definitions.json", JSON.stringify(def))

