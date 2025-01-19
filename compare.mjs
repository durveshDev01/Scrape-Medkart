import e from 'express';
import * as scr from './scrape.mjs';

async function compareSearch(med_search_keyword) {
  let mdk = await scr.searchMedkart(med_search_keyword);
  return Promise.all(
    mdk.map(async (med) => {

      return {
        mdk: med,
        phe: (await scr.searchPharmeasy(med.name))[0]
      }
    })
  );
}



async function compareProd(mdk_path, phe_path) {
  return {
    mdk: (await scr.scrapeMedkart(mdk_path)),
    phe: (await scr.scrapePharmeasy(phe_path))
  }
}

export { compareSearch, compareProd };