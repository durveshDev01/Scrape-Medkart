import { scrapeProd, scrapeSearch } from "./scrape.mjs";

scrapeSearch("para").then(
    (found) => {
        let product = found[2];
        scrapeProd(product.med_path).then(
            (prod) => {
                console.log(prod);
                console.log(product);
            }
        )
    }
)
