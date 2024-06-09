const fs = require("fs");
const path = require("path");
const {XMLParser} = require("fast-xml-parser");
const xmlParser = new XMLParser({ignoreAttributes: false, attributeNamePrefix: "@_"});

// whether or not to create a copy of the simulation directory called "modified simulation"
// is set to false when rerunning the script
const createNewSimulationDirectory = !fs.existsSync('modified simulation');

/* if false it removes the contents of the history tag from the templates the simulation directory
 * and replaces them with links to the encyclopedia article
 *
 * if true it does not touch the original simulation directory 
 * and instead writes the links to the directory called "modified simulation"
 */ 
const editNewSimulationDirectory = true;

const civData = 
{
    athen: { name: "Athenians", adjective: "Athenian" },
    brit: { name: "Britons", adjective: "Briton" },
    cart: { name: "Carthaginians", adjective: "Carthaginian" },
    gaul: { name: "Gauls", adjective: "Gaul" },
    han: { name: "Han", adjective: "Han" },
    iber: { name: "Iberians", adjective: "Iberian" },
    kush: { name: "Kushites", adjective: "Kushite" },
    mace: { name: "Macedonians", adjective: "Macedonian" },
    maur: { name: "Mauryas", adjective: "Mauryan" },
    pers: { name: "Persians", adjective: "Persian" },
    ptol: { name: "Ptolemies", adjective: "Ptolemaic" },
    rome: { name: "Romans", adjective: "Roman" },
    sele: { name: "Seleucids", adjective: "Seleucid" },
    spart: { name: "Spartans", adjective: "Spartan" }
  };
const militaryKeywords = ["warship", "military", "cavalry", "infantry", "champion", "siege", "defensive"];
const endingsToRemove = [".xml", ".md", "_b", "_packed", "encyclopedia_", "template_", "structure_", "unit_", "gaia_", "defensive_", "military_", "economic_"]


// if a file is found among the keys of the hardcodedPlacements it is always placed into the directory stored in its value, ignoring everything else
const hardcodedPlacements = 
{
    "encyclopedia_siege_helepolis.xml":"parent articles/",
    "encyclopedia_siege_lithobolos.xml":"parent articles/",
    "encyclopedia_siege_oxybeles.xml":"parent articles/",
    "encyclopedia_siege_ram.xml":"parent articles/",
    "encyclopedia_athens_walls.xml":"0 A.D.'s Civilizations/Athenians/Athenian military/",
    "encyclopedia_greek_corral.xml":"parent articles/",
    "encyclopedia_greek_farmstead.xml":"parent articles/",
    "encyclopedia_greek_field.xml":"parent articles/",
    "encyclopedia_hellenistic_house.xml":"parent articles/",
    "encyclopedia_palisade.xml":"The Ancient World/Ancient warfare/",
    "encyclopedia_towers.xml":"The Ancient World/Ancient warfare/",
    "encyclopedia_wall.xml":"The Ancient World/Ancient warfare/",
    "encyclopedia_bireme.xml":"parent articles/",
    "encyclopedia_trireme.xml":"parent articles/",
    "encyclopedia_quinquereme.xml":"parent articles/",
    "encyclopedia_penteconter.xml":"parent articles/",
    "athen.xml":"0 A.D.'s civilizations/Athenians/",
    "brit.xml":"0 A.D.'s civilizations/Britons/",
    "cart.xml":"0 A.D.'s civilizations/Carthaginians/",
    "gaul.xml":"0 A.D.'s civilizations/Gauls/",
    "han.xml":"0 A.D.'s civilizations/Han/",
    "iber.xml":"0 A.D.'s civilizations/Iberians/",
    "kush.xml":"0 A.D.'s civilizations/Kushites/",
    "mace.xml":"0 A.D.'s civilizations/Macedonians/",
    "maur.xml":"0 A.D.'s civilizations/Mauryas/",
    "pers.xml":"0 A.D.'s civilizations/Persians/",
    "ptol.xml":"0 A.D.'s civilizations/Ptolemies/",
    "rome.xml":"0 A.D.'s civilizations/Romans/",
    "sele.xml":"0 A.D.'s civilizations/Seleucids/",
    "spart.xml":"0 A.D.'s civilizations/Spartans/",
    "Battle_of_Gaixia.md":"Wars and Battles/Ancient China/",
    "Battle_of_Gaugamela.md":"Wars and Battles/Ancient Greece/",
    "Battle_of_Jingxing.md":"Wars and Battles/Ancient China/",
    "Battle_of_Mobei.md":"Wars and Battles/Ancient China/",
    "elephants_in_the_hellenistic_world.md":"parent articles/",
    "Han_Xiognu_war.md":"Wars and Battles/Ancient China/",
    "Hellenistic cavalry warfare.md":"parent articles/",
    "the sling.md":"The Ancient World/Ancient warfare/",
    "war_over_the_heavenly_horses.md":"Wars and Battles/Ancient China/",
    "template_unit_siege_tower.xml":"The Ancient World/Ancient warfare",
    "encyclopedia_silvershields.xml":"0 A.D.'s civilizations/Macedonians/Macedonian military/",
    "encyclopedia_healer_greek.xml":"parent articles/",
    "encyclopedia_han_xin.xml":"0 A.D.'s civilizations/Han/Han heroes/",
    "encyclopedia_liu_bang.xml":"0 A.D.'s civilizations/Han/Han heroes/",
    "encyclopedia_han_crossbow.xml":"0 A.D.'s civilizations/Han/Han military/"
}
var g_EncyclopediaStructure = 
{
    "About this Encyclopedia":{},
    
    "Nature and Environment":
    {
        "Animals":{},
        "Vegetation":{},
        "Other map items":{}
    },

    "The Ancient World":
    {
        "Ancient warfare":{},
        "Ancient society":{},
    },

    "0 A.D.'s Civilizations":
    {
        "Athenians":
        {
            "Athenian military":{},
            "Athenian society":{},
            "Athenian heroes":{}
        },

        "Britons":
        {
            "Briton military":{},
            "Briton society":{},
            "Briton heroes":{}
        },

        "Carthaginians":
        {
            "Carthaginian military":{},
            "Carthaginian society":{},
            "Carthaginian heroes":{}
        },

        "Gauls":
        {
            "Gaul military":{},
            "Gaul society":{},
            "Gaul heroes":{}
        },

        "Han":
        {
            "Han military":{},
            "Han society":{},
            "Han heroes":{}
        },

        "Iberians":
        {
            "Iberian military":{},
            "Iberian society":{},
            "Iberian heroes":{}
        },

        "Kushites":
        {
            "Kushite military":{},
            "Kushite society":{},
            "Kushite heroes":{}
        },

        "Macedonians":
        {
            "Macedonian military":{},
            "Macedonian society":{},
            "Macedonian heroes":{}
        },

        "Mauryas":
        {
            "Mauryan military":{},
            "Mauryan society":{},
            "Mauryan heroes":{}
        },

        "Persians":
        {
            "Persian military":{},
            "Persian society":{},
            "Persian heroes":{}
        },

        "Ptolemies":
        {
            "Ptolemaic military":{},
            "Ptolemaic society":{},
            "Ptolemaic heroes":{}
        },

        "Romans":
        {
            "Roman military":{},
            "Roman society":{},
            "Roman heroes":{}
        },

        "Seleucids":
        {
            "Seleucid military":{},
            "Seleucid society":{},
            "Seleucid heroes":{}
        },

        "Spartans":
        {
            "Spartan military":{},
            "Spartan society":{},
            "Spartan heroes":{}
        }

    },
    "Wars and Battles":
    {
        "Ancient China":{},
        "Ancient Greece":{},
        "The Hellenistic age":{}
    }, 
    "parent articles":{}
};

const directories = [{
    "source": "simulation/templates/units/",
    "target": "0 A.D.'s Civilizations/",
    "hasCivs": true
},
{
    "source": "simulation/templates/structures/",
    "target": "0 A.D.'s Civilizations/",
    "hasCivs": true
},
{
    "source": "simulation/templates/mixins/encyclopedia/",
    "target": "The Ancient World/",
    "hasCivs": false
},
{
    "source": "simulation/templates/",
    "target": "The Ancient World/",
    "hasCivs": false
},
{
    "source": "simulation/templates/special/players/",
    "target": "0 A.D.'s Civilizations/",
    "hasCivs": false,
    "targetName": "overview"
},
{
    "source": "simulation/templates/gaia/",
    "target": "Nature and Environment/animals/",
    "hasCivs": false
},
{
    "source": "simulation/templates/gaia/fish/",
    "target": "Nature and Environment/animals/",
    "hasCivs": false
},
{
    "source": "simulation/templates/gaia/fruit/",
    "target": "Nature and Environment/vegetation/",
    "hasCivs": false
},
{
    "source": "simulation/templates/gaia/tree/",
    "target": "Nature and Environment/vegetation/",
    "hasCivs": false
},
{
    "source": "simulation/templates/gaia/ruins/",
    "target": "Nature and Environment/other map items/",
    "hasCivs": false
},
{
    "source": "simulation/templates/gaia/treasure/",
    "target": "Nature and Environment/other map items/",
    "hasCivs": false
},
{
    "source": "unused/",
    "target": "general/",
    "hasCivs": false,
    "dontModify":true
}
];

function copyDirectory(from, to) 
{
    console.log("copying data from " + from + " to " + to + "...")
    fs.mkdirSync(to);
    console.log("created directory " + to)
    fs.readdirSync(from).forEach(element => {
        if (fs.lstatSync(path.join(from, element)).isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
            console.log("copied file " + element + " from " + from + " to " + to)
        } else {
            copyDirectory(path.join(from, element), path.join(to, element));
        }
    });
}

function createDirStructure(basePath, obj) 
{
    for (var key in obj) {
        const fullPath = path.join(basePath, key);
        if (Object.keys(obj[key]).length)
            createDirStructure(fullPath, obj[key]);
        else
            fs.mkdirSync(fullPath, {recursive: true}, (err) => 
            {
                if (err)
                    console.log(err);
                else
                    console.log("created directory " + fullPath);
            });
    }
}

function listDirFiles(dir) 
{
    const files = fs.readdirSync(dir);
    console.log("opened directory " + dir);
    return files.filter(file => path.extname(file) == ".xml" || path.extname(file) == ".md");
}

function readData(dir, fileName)
{
    console.log("read data from " + path.join(dir, fileName));
    const content = fs.readFileSync(path.join(dir, fileName), {encoding: "utf-8"});
    const trimmedFileName = endingsToRemove.reduce((string, ending)=> 
        {
            const index = string.indexOf(ending);
            return index == 0 || index == string.length - ending.length? string.replace(ending, "") : string;
        }, fileName)
    const cleanedFileName = trimmedFileName
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.substring(1))
        .join(" ");

    if (!(path.extname(fileName) == ".xml"))
        return {article:content, name:cleanedFileName, parent:null};

    const xmlData = xmlParser.parse(content);
        if (Object.keys(xmlData.Entity).includes("Identity"))
        {
            const article = xmlData.Entity.Identity.History;
            const parent = xmlData.Entity["@_parent"];
            return {article:article, name:xmlData.Entity.Identity.GenericName || cleanedFileName, parent:parent}

        }
    return {article:null};
}           

function cleanUp(str)
{
    if (str)
        return str.trim().replaceAll(/\]|\[/g, "").escape().replaceAll(/\s{3,}/g, "");
    else
        return;
}


String.prototype.escape = function () 
{
    return this.replace(/["\\\/\b\f\n\r\t]/g, function (char) {
        switch (char) {
        case "\b":
            return "\\b";
        case "\f":
            return "\\f";
        case "\n":
            return "\\n\\n";
        case "\r":
            return "\\r";
        case "\t":
            return "\\t";
        case "\"":
        case "\\":
        case "/":
            return "\\" + char;
        }
    });
};
function categorize(targetDir, fileName, parent, civ) 
{
    if (Object.keys(hardcodedPlacements).includes(fileName))
    {
        console.log("found hardcoded path for " + fileName + ": " + hardcodedPlacements[fileName]);
        return hardcodedPlacements[fileName];
    }
    switch (targetDir)
    {
        case "The Ancient World/":
            if (militaryKeywords.some(el => fileName.includes(el)))
                return path.join("The Ancient World", "Ancient warfare")
            else
                return path.join("The Ancient World", "Ancient society")
        case "0 A.D.'s Civilizations/":
            const targetPath = path.join("0 A.D.'s Civilizations/", civData[civ].name);
            if (fileName.includes("hero_")) 
                return path.join(targetPath, civData[civ].adjective + " heroes");
            else if (militaryKeywords.some(el => parent.includes(el)))
                return path.join(targetPath, civData[civ].adjective + " military");
            else 
                return path.join(targetPath, civData[civ].adjective + " society");
        default:
            return targetDir;
        
    }
}

function writeToJSON(filePath, article, title)
{
    let json = "{\n    \"title\":\"" + title + "\",\n    \"content\":\"" + article + "\"\n}"
    fs.writeFileSync(path.join("gui/encyclopedia/articles/", filePath, title + ".json"), json);
    console.log("wrote to " + path.join(filePath, title + ".json"))
}

function editHistoryTag(dir, fileName, newHistory)
{
    const content = fs.readFileSync(path.join(dir, fileName), {encoding: "utf-8"});

    //editing the content directly without parsing and rebuilding to avoid removing comments, changing indentation or formatting
    const newContent = content.slice(0, content.indexOf("<History>") + 9) + newHistory + content.slice(content.indexOf("</History>"));
    fs.writeFileSync(path.join(dir, fileName), newContent, {encoding: "utf-8"});
    console.log("edited history contents of " + path.join(dir, fileName));
}

function run() 
{
    if (createNewSimulationDirectory)
         copyDirectory("simulation/", "modified simulation");
    createDirStructure("gui/encyclopedia/", {"articles":g_EncyclopediaStructure});
    for (let dir of directories) 
    {
        for (let civ of (dir.hasCivs? Object.keys(civData) : [null]))
        {
            const sourceDir = dir.source + (civ ? civ : "");

            let files = listDirFiles(sourceDir);
            for (let file of files) 
            {
                const data = readData(sourceDir, file);
                if (data.article)
                {
                    const cleanedArticle = cleanUp(data.article);
                    const dirPath = categorize(dir.target, file, data.parent, civ);
                    const name = dir.targetName || data.name;
                    writeToJSON(dirPath, cleanedArticle, name);
                    if (!dir.dontModify)
                    {
                    const dirToEdit = (editNewSimulationDirectory? "modified ": "") + dir.source + (civ? civ + "/" : "");    
                    editHistoryTag(dirToEdit, file, path.join(dirPath, name + ".json"));
                    }
                }
            }
        }
    }
}
run();