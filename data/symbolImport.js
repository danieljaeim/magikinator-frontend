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

let symbolMap = {
  '{T}': 'https://svgs.scryfall.io/card-symbols/T.svg',
  '{Q}': 'https://svgs.scryfall.io/card-symbols/Q.svg',
  '{E}': 'https://svgs.scryfall.io/card-symbols/E.svg',
  '{PW}': 'https://svgs.scryfall.io/card-symbols/PW.svg',
  '{CHAOS}': 'https://svgs.scryfall.io/card-symbols/CHAOS.svg',
  '{A}': 'https://svgs.scryfall.io/card-symbols/A.svg',
  '{TK}': 'https://svgs.scryfall.io/card-symbols/TK.svg',
  '{X}': 'https://svgs.scryfall.io/card-symbols/X.svg',
  '{Y}': 'https://svgs.scryfall.io/card-symbols/Y.svg',
  '{Z}': 'https://svgs.scryfall.io/card-symbols/Z.svg',
  '{0}': 'https://svgs.scryfall.io/card-symbols/0.svg',
  '{½}': 'https://svgs.scryfall.io/card-symbols/HALF.svg',
  '{1}': 'https://svgs.scryfall.io/card-symbols/1.svg',
  '{2}': 'https://svgs.scryfall.io/card-symbols/2.svg',
  '{3}': 'https://svgs.scryfall.io/card-symbols/3.svg',
  '{4}': 'https://svgs.scryfall.io/card-symbols/4.svg',
  '{5}': 'https://svgs.scryfall.io/card-symbols/5.svg',
  '{6}': 'https://svgs.scryfall.io/card-symbols/6.svg',
  '{7}': 'https://svgs.scryfall.io/card-symbols/7.svg',
  '{8}': 'https://svgs.scryfall.io/card-symbols/8.svg',
  '{9}': 'https://svgs.scryfall.io/card-symbols/9.svg',
  '{10}': 'https://svgs.scryfall.io/card-symbols/10.svg',
  '{11}': 'https://svgs.scryfall.io/card-symbols/11.svg',
  '{12}': 'https://svgs.scryfall.io/card-symbols/12.svg',
  '{13}': 'https://svgs.scryfall.io/card-symbols/13.svg',
  '{14}': 'https://svgs.scryfall.io/card-symbols/14.svg',
  '{15}': 'https://svgs.scryfall.io/card-symbols/15.svg',
  '{16}': 'https://svgs.scryfall.io/card-symbols/16.svg',
  '{17}': 'https://svgs.scryfall.io/card-symbols/17.svg',
  '{18}': 'https://svgs.scryfall.io/card-symbols/18.svg',
  '{19}': 'https://svgs.scryfall.io/card-symbols/19.svg',
  '{20}': 'https://svgs.scryfall.io/card-symbols/20.svg',
  '{100}': 'https://svgs.scryfall.io/card-symbols/100.svg',
  '{1000000}': 'https://svgs.scryfall.io/card-symbols/1000000.svg',
  '{∞}': 'https://svgs.scryfall.io/card-symbols/INFINITY.svg',
  '{W/U}': 'https://svgs.scryfall.io/card-symbols/WU.svg',
  '{W/B}': 'https://svgs.scryfall.io/card-symbols/WB.svg',
  '{B/R}': 'https://svgs.scryfall.io/card-symbols/BR.svg',
  '{B/G}': 'https://svgs.scryfall.io/card-symbols/BG.svg',
  '{U/B}': 'https://svgs.scryfall.io/card-symbols/UB.svg',
  '{U/R}': 'https://svgs.scryfall.io/card-symbols/UR.svg',
  '{R/G}': 'https://svgs.scryfall.io/card-symbols/RG.svg',
  '{R/W}': 'https://svgs.scryfall.io/card-symbols/RW.svg',
  '{G/W}': 'https://svgs.scryfall.io/card-symbols/GW.svg',
  '{G/U}': 'https://svgs.scryfall.io/card-symbols/GU.svg',
  '{B/G/P}': 'https://svgs.scryfall.io/card-symbols/BGP.svg',
  '{B/R/P}': 'https://svgs.scryfall.io/card-symbols/BRP.svg',
  '{G/U/P}': 'https://svgs.scryfall.io/card-symbols/GUP.svg',
  '{G/W/P}': 'https://svgs.scryfall.io/card-symbols/GWP.svg',
  '{R/G/P}': 'https://svgs.scryfall.io/card-symbols/RGP.svg',
  '{R/W/P}': 'https://svgs.scryfall.io/card-symbols/RWP.svg',
  '{U/B/P}': 'https://svgs.scryfall.io/card-symbols/UBP.svg',
  '{U/R/P}': 'https://svgs.scryfall.io/card-symbols/URP.svg',
  '{W/B/P}': 'https://svgs.scryfall.io/card-symbols/WBP.svg',
  '{W/U/P}': 'https://svgs.scryfall.io/card-symbols/WUP.svg',
  '{2/W}': 'https://svgs.scryfall.io/card-symbols/2W.svg',
  '{2/U}': 'https://svgs.scryfall.io/card-symbols/2U.svg',
  '{2/B}': 'https://svgs.scryfall.io/card-symbols/2B.svg',
  '{2/R}': 'https://svgs.scryfall.io/card-symbols/2R.svg',
  '{2/G}': 'https://svgs.scryfall.io/card-symbols/2G.svg',
}

export default symbolMap;

