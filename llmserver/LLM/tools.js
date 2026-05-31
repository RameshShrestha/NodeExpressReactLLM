const tools = async () => {
    return [
       
        {
            "type": "function",
            "function": {
                "name": "getDetailsFromWeb",
                "description": "Get details from the web for a given topic which needs upto date information or does not include in internal knowledge",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query_topic": {
                            "type": "string",
                            "description": "The topic to search for on the web, when you do not know the answer"
                        }

                    },
                    "required": ["query_topic"]  // This is a placeholder for the rest of the code that needs to be filled in
                }

            }
        }

    ];
}


export  {tools};
