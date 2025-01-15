import express from 'express';
import {scrapePharmeasy, searchPharmeasy} from './scrape.mjs';

const app = express();

app.get('/get/pharmeasy/:id', async (req, res) => {
    res.json(await searchPharmeasy(req.params.id));
})

app.get('/info/pharmeasy/online-medicine-order/:id', async (req, res) => {
    res.json(await scrapePharmeasy(req.params.id));
})

app.listen(3000, () => console.log('Server started on port http://localhost:3000'));