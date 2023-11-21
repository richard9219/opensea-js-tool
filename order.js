const Ethers = require("ethers");
const { OpenSeaSDK, Chain } = require("opensea-js");
const config = require('./config.js');



const provider = new Ethers.providers.JsonRpcProvider(config.opRPCURL);

const walletWithProvider = new Ethers.Wallet(config.accountPrivateKey, provider);

const openseaSDK = new OpenSeaSDK(walletWithProvider, {
    chain: Chain.Optimism,
    apiKey: config.openseaApiKey,
    apiBaseUrl: config.openseaBaseURL,
});

const asset = {
    tokenAddress: config.tokenAddress,
    tokenId: config.tokenId,
    tokenStandard: config.tokenStandard,
};


const listOrder = async () => {
    const balance = await openseaSDK.getBalance({
        asset: asset,
        accountAddress: config.accountAddress,
    });
    console.log("opensea-js-tool:listOrder/balance", balance.toNumber())

    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);
    const listingParm = {
        asset: asset,
        accountAddress: config.accountAddress,
        startAmount: config.startAmount,
        expirationTime,
    };
    const listingResp = await openseaSDK.createListing(listingParm)
    console.log("opensea-js-tool:listOrder/listing order", listingResp)
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



const myArgs = process.argv.slice(2);
let list = 0;
let show = 0;
let encode = 0;
for (let i = 0; i < myArgs.length; i++) {
    if (myArgs[i] === "-list") {
        list = 1;
        console.log("opensea-js-tool:argv/list", list);
    }
    if (myArgs[i] === "-show") {
        show = 1;
        console.log("opensea-js-tool:argv/show", show);
    }
}

if (list) {
    listOrder();
}

if (show) {
    showOrder();
}
