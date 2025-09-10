import axios from "axios";
import * as cheerio from "cheerio";


async function searchMedkart(medId) {

  // url to scrape
  let baseUrl = "https://www.medkart.in/search/all?page=1&search=";
  let medicineUrl = baseUrl + medId;

  // web response
  let res = await axios.get(medicineUrl);
  let $ = cheerio.load(res.data);

  // Find all product cards
  let productCards = $('div.card-style');
  let products = productCards.map((_idx, card) => {
    let $card = $(card);
    let image = $card.find('img').last().attr('src');
    let path = $card.find('a').attr('href');
    let name = $card.find('a p').first().text().trim();
    let composition = $card.find('a').parent().find('p').eq(1).text().trim();
    let manufacturer = $card.find('a').parent().find('p').eq(2).text().replace(/^by /i, '').trim();
    // Find the price column (the flex column with margin-top: auto)
    // Try to find price, mrp, discount using more robust selectors
    let mrp = '';
    let price = '';
    let discount = '';
    // MRP: look for <p> with line-through style or parent with 'MRP ₹'
    let mrpP = $card.find('p[style*="line-through"]');
    if (mrpP.length) {
      mrp = mrpP.text().replace(/[^\d.]/g, '');
    } else {
      // fallback: find p after 'MRP ₹'
      let mrpLabel = $card.find('p').filter((i, el) => $(el).text().includes('MRP ₹'));
      if (mrpLabel.length) {
        let nextP = mrpLabel.next('p');
        if (nextP.length) mrp = nextP.text().replace(/[^\d.]/g, '');
      }
    }
    // Price: look for <p> with font-weight: 700 (bold price)
    let priceP = $card.find('p[style*="font-weight: 700"]');
    if (priceP.length) {
      price = priceP.first().text().replace(/[^\d.]/g, '');
    }
    // Fallback: if price is missing or empty, try to calculate price as mrp - discount
    if (!price || price === '') {
      // If both mrp and discount are available and numeric, calculate price
      let mrpNum = parseFloat(mrp);
      let discountNum = parseFloat(discount);
      if (!isNaN(mrpNum) && !isNaN(discountNum) && discountNum > 0) {
        price = (mrpNum - discountNum).toFixed(2);
      } else {
        price = mrp;
      }
    }
    // Discount: look for <p> with color: rgb(6, 118, 71) or contains 'OFF'
    let discountP = $card.find('p').filter((i, el) => $(el).text().includes('OFF'));
    if (discountP.length) {
      discount = discountP.first().text().replace(/OFF|%|\s/g, '');
    }
    console.log({price, mrp, discount});
    return {
      path,
      image,
      name,
      composition,
      manufacturer,
      mrp,
      price,
      discount
    };
  }).get();

  return products;

};



async function searchPharmeasy(query) {
  try {
    let res = await axios.get("https://pharmeasy.in/search/all?name=" + query, { timeout: 15000 });
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
  } catch (error) {
    console.error("Error fetching from pharmeasy:", error.message);
    return [];
  }
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
