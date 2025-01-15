import axios from "axios";
import * as cheerio from "cheerio";


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

};


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
      med_path: medicine_path,
      med_image: med_image,
      med_name: medicine_name,
      medicine_unit: medicine_unit,
      med_brand: med_brand,
      medicine_mrp: medicine_mrp,
      med_price: price.replace(off, ''),
      med_off: off,
    };
  }).get();

  return details;
}

async function scrapePharmeasy(uri) {
  let res = await axios.get("https://pharmeasy.in/online-medicine-order/" + uri);
  let $ = cheerio.load(res.data);
  
  let rows = $('table[class^="DescriptionTable_seoTable"]').find('tr');

  let details = rows.map((_idx, row) => {
    let $row = $(row);
    let key = $row.find('td[class^="DescriptionTable_field"]').text();
    let value = $row.find('td[class^="DescriptionTable_value"]').text();

    return {
      [key]: value
    };
  }).get();
  
  let alternate = $('div[class^="OtherVariants_root"]').find("li").map((_idx, li) => {
    let $li = $(li);
    let name = $li.text();
    let link = "https://pharmeasy.in" + $li.find('a').attr("href");

    return {
      name: name,
      link: link
    }
  }).get();

  let disclaimer = $('div[class^="Disclaimer_content"]').text();

  return {
    details: details,
    alternate: alternate,
    disclaimer: disclaimer
  }
}

// scrapePharmeasy("https://pharmeasy.in/online-medicine-order/dolopar-strip-of-15-tablets-19887")

export { searchPharmeasy, scrapePharmeasy, searchMedplus };