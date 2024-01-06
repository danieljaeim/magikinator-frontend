import symbolMap from './symbolImport.js';

export default function translateQuestionToString(question) {
    let isMatchQuestion = question.includes("@");
    let symbol = null;
    if (isMatchQuestion) {
        var column = question.split("@")[0].split("_").join(' ');
        var value = question.split("@")[1].split("_").join(' ');
        let colors_map = {
            'R': 'red',
            'U': 'blue',
            'B': 'black',
            'W': 'white',
            'G': 'green'
        }

        // Translate color letters into color names
        if (colors_map[value]) {
            value = colors_map[value]
        }

        // Translate bracket symbols into .svg links
        if (value in symbolMap) {
            console.log("Found " + value + " in symbolmap!")
            symbol = symbolMap[value]
        }

        return [`Does your card have ${column} ${value}`, symbol];
    }

    return [question.split("_").join(" "), symbol];
}

console.log(translateQuestionToString("mana_cost@{3}"))