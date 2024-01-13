import axios from 'axios';

async function getSymbolsFromScryfall() {
    const response = await axios.get("https://api.scryfall.com/symbology")
        .then(response => {
            symbol_url = {}
            response.data.data.forEach(symbol => {
                symbol_url[symbol.symbol] = symbol.svg_uri
            })
            return symbol_url
        })
        .catch(err => console.log(err))
    
    return response
}
