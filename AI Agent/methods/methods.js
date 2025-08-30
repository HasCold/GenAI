const sumFuncDeclaration = {
    name: "sum",
    description: "Get the sum of 2 numbers",
    parameters: {
        type: 'OBJECT',
        properties: {
            num1: {
                type: 'NUMBER',
                description: 'It will be first number for addition example: 10.'
            },
            num2: {
                type: 'NUMBER',
                description: 'It will be second number for addition example: 20.'
            },
        },
        required: ['num1', 'num2']
    }
}

const primeFuncDeclaration = {
    name: "prime",
    description: "Identify the given number is prime or not",
    parameters: {
        type: 'OBJECT',
        properties: {
            num: {
                type: 'NUMBER',
                description: 'It will be the number to find it is prime or not example: 30.'
            },
        },
        required: ['num']
    }
}

const fetchCryptoPriceFuncDeclaration = {
    name: "fetchCryptoPrice",
    description: "Fetch the current price of any cryptocurrency or crypto coin like Bitcoin, Ethereum, BNB etc.",
    parameters: {
        type: 'OBJECT',
        properties: {
            coin: {
                type: 'STRING',
                description: 'It will be the crypto currency name like bitcoin ethereum etc.'
            },
        },
        required: ['coin']
    }
}

export {sumFuncDeclaration, primeFuncDeclaration, fetchCryptoPriceFuncDeclaration}

// Structured Output example of the LLM :- 
// {
//     name: "prime",  // <<---- Function name
//     args: {num4},
// }