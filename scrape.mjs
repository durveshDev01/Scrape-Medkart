import axios from "axios";
import cherio from "cherio";

// url - https://www.medkart.in/order-medicine/paracetamol-500mg-tablet-20s
// fuction to scrape
async function scrapeProd(medId) {

  // url to scrape
  let baseUrl = "https://www.medkart.in/order-medicine/"
  let medicineUrl = baseUrl + medId;
  // web response
  let res = await axios.get(medicineUrl);
  // loading in cheerio
  let $ = cherio.load(res.data);

  // scrapping display card
  let productDisplayCard = $(".product-display-card");
  // display card -> image
  let imageUrl = productDisplayCard
    .find("#product-detail-main-image")
    .attr("src");
  //display card -> name
  let name = productDisplayCard
    .find('h1[class^="ProductDisplay_tablet_name"]')
    .text();
  // display card -> mrp price
  let contains = productDisplayCard.find("p").find("a").text();
  let mrp = productDisplayCard
    .find('span[class^="ProductDisplay_previous_price"]')
    .text();
  // display card -> discount price
  let price = productDisplayCard
    .find('span[class^="ProductDisplay_current_price"]')
    .text();
  // about product
  let about = $('div[class^="card"]')
    .map((_idx, card) => {
      let title = $(card).find('h2').text();
      let detail = $(card).find('li').map((_idx, det) => {
        return $(det).text().trim();
      }).get();
      let retdata = {};
      retdata[title] = detail;
      return retdata; 
    })
    .get();

// return scraped data
  return {
    name: name,
    contains: contains,
    mrp: mrp,
    price: price,
    about: about,
    imageUrl: baseUrl + imageUrl,
  };
}



async function scrapeSearch(query) {
  let res = await axios.get("https://www.medkart.in/search/all?name=" + query.toUpperCase());
  let $ = cherio.load(res.data);

  let medList = $('div[class^="MedicineList_listWrapper_"]');
  
  let cards = medList.find('div[class^="row position-relative ListingCard_"]');

  let details = cards.map((_idx, card) => {
    let $card = $(card);
    let medicine_path = $card.find('a[href^="/order-medicine/"]').attr("href");
    let medicine_name = $card.find('div[class^="d-flex"]').find('h3').text();
    let medicine_price = $card.find('div[class^="ListingCard_pricing"]').text();
    let price = $card.find(".pricing").find('h3').text();
    let mrp = $card.find(".pricing").find('h4').text();
    let off = $card.find('h5').text();
    let isAvailable = $card.find('div[class^="mt-3 mb-2 ListingCard_mobile_noSale"]').text();
    return {
      med_path: medicine_path,
      med_name: medicine_name,
      med_price: price,
      med_mrp: mrp,
      med_off: off,
      is_avl: isAvailable === '' ? true : false,
    };
  }).get();
  return details;
}

export { scrapeProd, scrapeSearch };
