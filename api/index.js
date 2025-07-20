const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path')

const PORT = process.env.PORT || 3000

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')))

app.get('/',(req,res)=>{
res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
})
app.get('/documents',(req,res)=>{
res.sendFile(path.join(__dirname, '..', 'public', 'document.html'));
})

app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
