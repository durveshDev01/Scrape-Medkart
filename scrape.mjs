import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from 'puppeteer';

import base64 from "base-64";

// url - https://www.medkart.in/order-medicine/paracetamol-500mg-tablet-20s
// fuction to scrape

const browser = await puppeteer.launch();
const page = await browser.newPage();

async function searchMedplus(medId) {

  // url to scrape
  let baseUrl = "https://www.medplusmart.com/"
  let medicineUrl = baseUrl + "searchAll/" + base64.encode("A::"+medId);
  console.log(medicineUrl);

  // web response
  let res = await axios.get(medicineUrl);
  // loading in cheerio
  let $ = cheerio.load(res.data);
  // scrapping display card
  let searchres = $("section");
  let productDisplayCards = searchres.find('div[class*="search-all-products"]');
  let products = productDisplayCards.map((_idx, card) => {
    
    let $card = $(card);
    console.log(_idx)
    let medicine_path = $card.find('a[role="link"]').attr("href");
    let med_image = $card.find('img').attr("src");
    let med_manufacturer = $card.find('p[class="font-12 text-secondary mb-1 text-truncate"]').text();
    let med_name = $card.find('h6[class="truncate-line-2"]').find('span').text();
    let med_mrp = $card.find('h6[class="mb-0"]').text();

    return {
      path: medicine_path,
      image: med_image,
      manufacturer: med_manufacturer,
      name: med_name,
      mrp: med_mrp
    };
  }).get();

  console.log(products)
};

// async function search_netmeds(medId) {

//   // url to scrape
//   let baseUrl = "https://www.netmeds.com/"
//   let medicineUrl = baseUrl + "catalogsearch/result/" + medId + "/all";

//   // web response
//   await page.goto(medicineUrl);

//   // loading in cheerio
//   let cards = await page.locator('ais-InfiniteHits-item');
//   let products = cards.map((_idx, card) => {
//     let $card = $(card);
//     console.log(_idx)
//     let medicine_path = $card.find('a[class="category_name"]').attr("href");
//     let med_image = $card.find('img').attr("src");
//     let med_manufacturer = $card.find('span[class="drug-varients ellipsis"]').text();
//     let med_name = $card.find('h3[class="clsgetname"]').find('span').text();
//     let med_mrp = $card.find('span[class="final-price"]').text();

//     return {
//       path: medicine_path,
//       image: med_image,
//       manufacturer: med_manufacturer,
//       name: med_name,
//       mrp: med_mrp
//     };
//   }).get();

//   console.log(products)
// };

async function searchPharmeasy(query) {
  let res = await axios.get("https://pharmeasy.in/search/all?name=" + query);
  let $ = cheerio.load(res.data);

  let medList = $('div[class^="LHS_container"]');

  let cards = medList.find('div[class^="Search_medicineLists"]');

  let details = cards.map((_idx, card) => {
    let $card = $(card);
    let medicine_path = $card.find('a[class^="ProductCard_"]').attr("href");
    let med_image = $card.find('img[alt="product"]').attr("src");
    let medicine_name = $card.find('h1[class^="ProductCard_medicineName"]').text();
    let medicine_unit = $card.find('div[class^="ProductCard_measurementUnit"]').text();
    let med_brand = $card.find('div[class^="ProductCard_brandName"]').text();
    let medicine_mrp = $card.find('div[class^="ProductCard_priceContainer"]').find('span[class^="ProductCard_striked"]').text();
    let price = $card.find('div[class^="ProductCard_gcdDiscountContainer"]').text();
    let off = $card.find('span[class^="ProductCard_gcdDiscountPercent"]').text();

    return {
      med_path: "https://pharmeasy.in" + medicine_path,
      med_image: med_image,
      med_name: medicine_name,
      medicine_unit: medicine_unit,
      med_brand: med_brand,
      medicine_mrp: medicine_mrp,
      med_price: price.replace(off, ''),
      med_off: off,
    };
  }).get();
  console.log(details);
  return details;
}

export { searchPharmeasy, searchMedplus };
