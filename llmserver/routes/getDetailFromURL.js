import * as cheerio from 'cheerio';
const getDetailFromURL = async(url)=>{
  try {
    const response = await fetch(url);
    const html = await response.text();
       const document = cheerio.load(html);
        document('script, style, noscript, iframe').remove();
         const rawText = document('body').text();
            const cleanText = rawText.replace(/\s+/g, ' ').trim();
            
    //return (' ' + cleanText).slice(1);
    return cleanText;

   // console.log(html); 
  } catch (error) {
    console.error('Error fetching markup:', error);
    return '';
  }
}
export {getDetailFromURL};