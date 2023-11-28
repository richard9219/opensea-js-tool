const Ethers = require("ethers");
const { OpenSeaSDK, Chain } = require("opensea-js");
const config = require('./config.js');


const asset = {
    tokenAddress: config.tokenAddress,
    tokenId: config.tokenId,
    tokenStandard: config.tokenStandard,
};

const provider = new Ethers.providers.JsonRpcProvider(config.opRPCURL);


const listOrder = async () => {

    const walletWithProvider = new Ethers.Wallet(config.sellAccountPrivateKey, provider);

    const openseaSDK = new OpenSeaSDK(walletWithProvider, {
        chain: Chain.Optimism,
        apiKey: config.openseaApiKey,
        apiBaseUrl: config.openseaBaseURL,
    });

    const balance = await openseaSDK.getBalance({
        asset: asset,
        accountAddress: config.sellAccountAddress,
    });
    console.log("opensea-js-tool:listOrder/balance", balance.toNumber())

    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);
    const listingParm = {
        asset: asset,
        accountAddress: config.sellAccountAddress,
        startAmount: config.startAmount,
        expirationTime,
    };
    const listingResp = await openseaSDK.createListing(listingParm)
    console.log("opensea-js-tool:listOrder/listing order", listingResp)
}

const takeOrder = async () => {

    const walletWithProvider = new Ethers.Wallet(config.buyAccountPrivateKey, provider);

    const openseaSDK = new OpenSeaSDK(walletWithProvider, {
        chain: Chain.Optimism,
        apiKey: config.openseaApiKey,
        apiBaseUrl: config.openseaBaseURL,
    });

    const order = await openseaSDK.api.getOrder({ asset_contract_address: config.tokenAddress, tokenId: config.tokenId })
    console.log("opensea-js-tool:takeOrder/getOrder order", order)
    const takeResp = await openseaSDK.fulfillOrder({
        order,
        accountAddress: config.accountAddress,
        recipientAddress: config.accountAddress,
    })
    console.log("opensea-js-tool:takeOrder/take order", takeResp)
}


const showOrder = async () => {
    // Get offers (bids), a.k.a. orders where `side == 0`
    const { orders1, count1 } = await openseaSDK.api.getOrders({
        assetContractAddress: config.tokenAddress,
        side: "bid",
    });
    console.log("opensea-js-tool:showOrder/bid orders,count", orders1, count1)

    // Get page 2 of all auctions, a.k.a. orders where `side == 1`
    const { orders2, count2 } = await openseaSDK.api.getOrders(
        {
            assetContractAddress: config.tokenAddress,
            side: "ask",
        },
        2,
    );
    console.log("opensea-js-tool:showOrder/ask orders,count", orders2, count2)
}



// const encodePara = async () => {
//     console.log("encodePara");
//     const res =
//     {
//         "BasicOrderParameters": {
//             "considerationToken": 'address',
//             "considerationIdentifier": 'uint256',
//             "considerationAmount": 'uint256',
//             "offerer": 'address',
//             "zone": 'address',
//             "offerToken": 'address',
//             "offerIdentifier": 'uint256',
//             "offerAmount": 'uint256',
//             "basicOrderType": 'uint8',
//             "startTime": 'uint256',
//             "endTime": 'uint256',
//             "zoneHash": 'bytes32',
//             "salt": 'uint256',
//             "offererConduitKey": 'bytes32',
//             "fulfillerConduitKey": 'bytes32',
//             "totalOriginalAdditionalRecipients": 'uint256',
//             "AdditionalRecipient[]": {
//                 "amount": 'uint256',
//                 "recipient": 'address'
//             },
//             "signature": 'bytes'
//         }
//     };
//     const vars = {
//         "considerationToken": para.consideration[0].token,
//         "considerationIdentifier": para.consideration[0].identifierOrCriteria,
//         "considerationAmount": para.consideration[0].endAmount,
//         "offerer": para.offerer,
//         "zone": para.zone,
//         "offerToken": para.offer[0].token,
//         "offerIdentifier": para.offer[0].identifierOrCriteria,
//         "offerAmount": para.offer[0].endAmount,
//         "basicOrderType": para.orderType,
//         "startTime": para.startTime,
//         "endTime": para.endTime,
//         "zoneHash": para.zoneHash,
//         "salt": para.salt,
//         "offererConduitKey": para.conduitKey,
//         "fulfillerConduitKey": para.conduitKey,
//         "totalOriginalAdditionalRecipients": para.totalOriginalConsiderationItems - 1,
//         "AdditionalRecipient": [
//             {
//                 "amount": para.consideration[1].endAmount,
//                 "recipient": para.consideration[1].recipient
//             }, {
//                 "amount": para.consideration[2].endAmount,
//                 "recipient": para.consideration[2].recipient
//             }],
//         "signature": sample.signature
//     }
//     const encode = web3.eth.abi.encodeParameter(res, vars);
//     console.log("0xfb0f3ee1" + encode.substring(2));
// }



const myArgs = process.argv.slice(2);
let list = 0;
let take = 0;
let show = 0;
// let encode = 0;
for (let i = 0; i < myArgs.length; i++) {
    if (myArgs[i] === "-list") {
        list = 1;
        console.log("opensea-js-tool:argv/list", list);
    }
    if (myArgs[i] === "-take") {
        take = 1;
        console.log('opensea-js-tool:argv/take', take);
    }
    if (myArgs[i] === "-show") {
        show = 1;
        console.log("opensea-js-tool:argv/show", show);
    }
    // if (myArgs[i] === "-encode") {
    //     encode = 1;
    //     console.log('opensea-js-tool:argv/encode', encode);
    // }
}

if (list) {
    listOrder();
}

if (take) {
    takeOrder();
}

if (show) {
    showOrder();
}

// if (encode) {
//     encodePara();
// }

