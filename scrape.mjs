import axios from "axios";
import * as cheerio from "cheerio";


async function searchMedkart(medId) {

  // url to scrape
  let baseUrl = "https://www.medkart.in/search/all?name=";
  let medicineUrl = baseUrl + medId;

  // web response
  let res = await axios.get(medicineUrl);
  // loading in cheerio
  let $ = cheerio.load(res.data);
  // scrapping display card
  let searchres = $('div[class^="MedicineList_listWrapper"]');
  let productDisplayCards = searchres.find('div[class*="listing-card"]');
  let products = productDisplayCards.map((_idx, card) => {
    
    let $card = $(card);

    let medicine_path = $card.find('a').attr("href");
    let med_image = $card.find('a').find('img').attr("src");
    let med_info = $card.find('div[class^="ListingCard_med"]');
    let med_name = med_info.find('h3').text();
    let med_manufacturer = med_info.find('h4').text();
    let med_price = $card.find('div[class*="ListingCard_pricing"]');
    let price = med_price.find('h3').text();
    let mrp = med_price.find('h4').text();
    let discount = med_price.find('h5').text();

    return {
      path: medicine_path,
      image: med_image,
      name: med_name,
      manifacturer: med_manufacturer,
      mrp: mrp,
      price: price,
      discount: discount
    };
  }).get();

  return products;

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
    let _price = $card.find('div[class^="ProductCard_gcdDiscountContainer"]').text()
    let price = (_price) != ''? _price : $card.find('div[class^="ProductCard_ourPrice"]').text().replace('MRP ₹', '').replace('*', '');
    let off = $card.find('span[class^="ProductCard_gcdDiscountPercent"]').text();

    return {
      path: medicine_path,
      image: med_image,
      name: medicine_name,
      unit: medicine_unit,
      manifacturer: med_brand,
      mrp: medicine_mrp,
      price: price.replace(off, ''),
      discount: off,
    };
  }).get();


  return details;
}

async function scrapePharmeasy(uri) {
  let res = await axios.get("https://pharmeasy.in/" + uri);
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

// scrapePharmeasy("/online-medicine-order/dolo-250mg-susp-44136").then((res) => {
//   console.log(res);
// })

// TODO: Complete scrapeMedkart
async function scrapeMedkart(uri) {
  let res = await axios.get("https://www.medkart.in/" + uri);
  let $ = cheerio.load(res.data);
  
  let rows = $('table[class="undefined table table-striped"]').find('tr');

  let details = rows.map((_idx, row) => {
    let $row = $(row);
    let key = $row.find('th').text();
    let value = $row.find('td').text();

    return {
      [key]: value
    };
  }).get();

  return details;
}

// searchPharmeasy("paraxin-500mg-capsule-10s");
// scrapePharmeasy("https://pharmeasy.in/online-medicine-order/dolopar-strip-of-15-tablets-19887")

export { searchPharmeasy, scrapePharmeasy, searchMedkart, scrapeMedkart };
