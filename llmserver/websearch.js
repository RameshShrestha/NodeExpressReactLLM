import axios from 'axios';
async function webSearch(query) {
    const apiKey = '4c98d54041ef47699671ebc6b4e3115d.tb4WEtYn30_6ECcpkNqWuj6R' ;//process.env.OLLAMA_API_KEY;
    const url = 'https://ollama.com/api/web_search';
    const body = {
        query: query,
        max_results : 1  
      };
    const config = {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    };
     try {
    const { data } = await axios.post(url, body, config);
   // console.log(data);
     return data;
  } catch (error) {
    console.error('Request failed:', error.response?.data || error.message);
    return error.response?.data || error.message;
  }
   
}

export default webSearch;