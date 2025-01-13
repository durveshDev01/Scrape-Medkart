import express from 'express';
import {scrapeProd, scrapeSearch} from './scrape.mjs';

const app = express();

app.get('/get-meds/:id', async (req, res) => {
    res.json(await scrapeSearch(req.params.id));
})

app.get('/medinfo/:id', async (req, res) => {
    res.json(await scrapeProd(req.params.id));
})

app.listen(3000, () => console.log('Server started on port http://localhost:3000'));