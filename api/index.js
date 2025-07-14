require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
const path = require('path')

const PORT = process.env.PORT || 3000

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')))
app.get("/fetchOtherAssetsBalanceInUsd", async (req, res) => {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${req.query.symbols}`;
  const options = {
    headers: {
      accept: 'application/json',
      'x-cg-demo-api-key': process.env.COINGECKO_API
    }
  }; 

  try {
    const response = await axios.get(url, options);
    let OtherAssetsPriceInUsd = {};
    (response.data).forEach(element => {
        OtherAssetsPriceInUsd[element.symbol] = element.current_price
    });
    res.json(OtherAssetsPriceInUsd);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

app.get('/',(req,res)=>{
res.sendFile(path.join(__dirname, '..', 'public', 'airdrop.html'));
})

app.get("/fetchHistoricalPrice", async (req, res) => {
  const url = "https://api.coingecko.com/api/v3/coins/list";
  const options = {
    headers: {
      accept: 'application/json',
      'x-cg-demo-api-key': process.env.COINGECKO_API
    }
  };

  try {
    const response = await axios.get(url, options);
    
    const { names, symbols } = req.query;
    
    if (!names && !symbols) {
      return res.status(400).json({ error: 'Please provide either names or symbols parameter (comma-separated)' });
    }
    
    let searchTokens = [];
    
    if (names) {
      searchTokens = names.split(',').map(name => ({ type: 'name', value: name.trim() }));
    } else if (symbols) {
      searchTokens = symbols.split(',').map(symbol => ({ type: 'symbol', value: symbol.trim() }));
    }
    
    const results = [];
    
    for (const token of searchTokens) {
      let coin;
      
      if (token.type === 'name') {
        coin = response.data.find(coin => 
          coin.name.toLowerCase() === token.value.toLowerCase()
        );
      } else if (token.type === 'symbol') {
        coin = response.data.find(coin => 
          coin.symbol.toLowerCase() === token.value.toLowerCase()
        );
      }
      
      if (coin) {
        try {
          const historyUrl = `https://api.coingecko.com/api/v3/coins/${coin.id}/history`;
          const historyOptions = {
            headers: {
              accept: 'application/json',
              'x-cg-demo-api-key': process.env.COINGECKO_API
            },
            params: {
              date: '22-12-2024'
            }
          };

          const historyResponse = await axios.get(historyUrl, historyOptions);
          
          results.push({
            id: historyResponse.data.id,
            symbol: historyResponse.data.symbol,
            name: historyResponse.data.name,
            date: '22-12-2024',
            price_usd: historyResponse.data.market_data.current_price.usd,
            market_cap_usd: historyResponse.data.market_data.market_cap.usd,
            total_volume_usd: historyResponse.data.market_data.total_volume.usd
          });
        } catch (historyErr) {
          results.push({
            search_term: token.value,
            error: 'Failed to fetch historical data for this token'
          });
        }
      } else {
        results.push({
          search_term: token.value,
          error: 'Token not found'
        });
      }
    }
    
    res.json(results);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch coin list' });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
