// Config

// ********* Truffle
// var wallet_address = '627306090abaB3A6e1400e9345bC60c78a8BEf57'; //local wallet with truffle
// var contract_address = '345ca3e014aaf5dca488057592ee47305d9b3e10';  //address of the new contract (CopyRight) truffle
// Wallet Private Key c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3
// Web3-Provider: http://localhost:9545

// ********** Rinkeby (Ethereum Testnet)
// wallet_address ='8B29A9EB2347d52D89F0678dDE0eD033feBdF4A7'; //rinkbey
// Contract: 0xf93E8cfb32d8ce4B28feAF26d8A857a74c83cd8E
// Web3-Provider/Infura: https://rinkeby.infura.io/NPDWCn9k71RH5knG9aPt
// Wallet Private Key: local (hehehe)


/// WebServer Init *    *****************************************************************************************
const express = require('express');
const app = express();
const port = process.env.PORT;
const STATUS_GET = "GOT REQUEST";
const STATUS_MONEY = "SENT MONEY";
const STATUS_CONTRACT = "SENT CONTRACT UPDATE";
const STATUS_ERROR = "ERROR";



var bodyParser = require('body-parser');
var redis = require("redis"), client = redis.createClient(process.env.REDIS_URL);

app.use(express.static('app'));
app.use('/bower_components', express.static('bower_components'));


app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true})); // to support URL-encoded bodies
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());


// make the constants available to the html web page
app.get('/config.js', function(req, res){
    res.send("var BC_FUELSERVER_URL='"+process.env.BC_FUELSERVER_URL+"';"+
             "var SMART_CONTRACT='"+process.env.SMART_CONTRACT+"';"+
             "var HTTP_PROVIDER='"+process.env.HTTP_PROVIDER+"'"
    );

});


////******************************************************************

/// Fuel Server Init  ******************************************************************************************

var Web3 = require('web3');
var utils = require('ethereumjs-util');
var Tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var Web3EthAccounts = require('web3-eth-accounts');
var txutils = lightwallet.txutils;
var Accounts = require('web3-eth-accounts');


// Wallet Address



var wallet_address ='0x'+process.env.WALLET_ADDRESS;
var wallet_key = process.env.WALLET_KEY;
var contract_address = process.env.SMART_CONTRACT;



// Fuel Server Functions ******************************************************************************************
var web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.HTTP_PROVIDER)
// new Web3.providers.HttpProvider('http://localhost:9545')
);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms)
)
    ;
}


/// Web Server Main ******************************************************************************************


app.get('/api/get_status', function(request, response){

    client.get("0x"+request.query.address, function (err, reply) {
        console.log("Got Request for:" + request.query.address + "Reply:"+reply);
        response.send(reply);
    })
});



app.get('/*', function(req, res){
    res.sendFile(__dirname + '/app/index.html');
    console.log("Got Request for index.html");
});

//// Post Requests for the Server

app.post('/api/blockchain2', function (req, res) {
    var store_asset_tx = new Tx(req.body.tx);
    var store_asset_tx_ser = store_asset_tx.serialize().toString('hex');

    var client_contract = "0x" + store_asset_tx.from.toString('hex');

    web3.eth.sendRawTransaction('0x' + store_asset_tx_ser, function (err, tx_hash_2) {
        if (err) {
            console.log("ERROR in BC2:"+err);
            client.set(client_contract, STATUS_CONTRACT);
            res.end("ERROR:"+err);
        } else {
            console.log("SUCCESS in BC2 with Hash:"+tx_hash_2);
            client.set(client_contract, STATUS_CONTRACT);
            res.send(tx_hash_2);
        }
    })
});

app.post('/api/blockchain1', function (req, res) {
    console.log("API-Blockchain1");
    var store_asset_tx = new Tx(req.body.tx);

    var client_contract = "0x" + store_asset_tx.from.toString('hex');

    client.set(client_contract, STATUS_GET);

    client.get(client_contract, function (err, reply) {
        console.log("Contract "+client_contract+" saved in redis with result:" + reply);
    });
    console.log("Test Web3:");
    console.log("Ether in Wallet:" + web3.eth.getBalance(wallet_address).toNumber());
    console.log("Sending money to:" + store_asset_tx.from.toString('hex'));

    var nonce=web3.eth.getTransactionCount(wallet_address,'pending');
    console.log("Nonce:" + nonce);

    var rawtx_send_money = {
        nonce: web3.toHex(nonce),
        from: wallet_address,
        to: client_contract,
        value: store_asset_tx.getUpfrontCost(),
        gasLimit: web3.toHex(800000),
        gasPrice: web3.toHex(web3.eth.gasPrice)
    };

    var privateKey = new Buffer(wallet_key, 'hex');
    var transaction = new Tx(rawtx_send_money);
    transaction.sign(privateKey);
    var serializedTx = transaction.serialize().toString('hex');

    web3.eth.sendRawTransaction('0x' + serializedTx, function (err, tx_hash) {
        if (err) {
            console.log("ERROR in BC1:"+err);
            client.set(client_contract, STATUS_CONTRACT);
            res.end("ERROR:"+err);
        } else {
            console.log("SUCCESS in BC1 with Hash:"+tx_hash);
            client.set(client_contract, STATUS_CONTRACT);
            res.end(tx_hash);
        }
    }) // else;

});


app.post('/api/blockchain', function (req, res) {

    var store_asset_tx = new Tx(req.body.tx);
    var store_asset_tx_ser = store_asset_tx.serialize().toString('hex');

    var client_contract = "0x" + store_asset_tx.from.toString('hex');

    client.set(client_contract, STATUS_GET);

    client.get(client_contract, function (err, reply) {
        console.log("Contract "+client_contract+" saved in redis with result:" + reply);
    });

    res.end("yes");

    console.log("Ether in Wallet:" + web3.eth.getBalance('0x25a8e4785eEC0C0c4D34Ff52E1259Aa6ce71342f').toNumber());
    console.log("Sending money to:" + store_asset_tx.from.toString('hex'));

    var rawtx_send_money = {
        nonce: web3.toHex(web3.eth.getTransactionCount(wallet_address)),
        from: wallet_address,
        to: client_contract,
        value: store_asset_tx.getUpfrontCost(),
        gasLimit: web3.toHex(800000),
        gasPrice: web3.toHex(web3.eth.gasPrice)
    };

    var privateKey = new Buffer(wallet_key, 'hex');
    var transaction = new Tx(rawtx_send_money);
    transaction.sign(privateKey);
    var serializedTx = transaction.serialize().toString('hex');

    web3.eth.sendRawTransaction('0x' + serializedTx, function (err, tx_hash) {
        if (err) {
            console.log(err);
        } else {
            console.log("Send cash ..wait for mining..." + tx_hash);

            while (true) {
                var tresult = web3.eth.getTransactionReceipt(tx_hash);
                console.log("Transaction result:" + tresult);

                if (tresult !== null) {
                    client.set(client_contract, STATUS_MONEY);
                    console.log("Mining Done - send Asset");

                    web3.eth.sendRawTransaction('0x' + store_asset_tx_ser, function (err, tx_hash_2) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(tx_hash_2);
                            while (true) {
                                var tresult = web3.eth.getTransactionReceipt(tx_hash_2);
                                console.log("Transaction result step 2:" + tresult);
                                if (tresult !== null) {
                                    client.set(client_contract, STATUS_CONTRACT);
                                    console.log("Request Completed");
                                    break;
                                }
                                sleep(500);
                            }
                        }
                    })

                    break;
                }
                sleep(500);
            } //while outer loop
        }
    }) // else;


});



app.listen(port, function() {
//  console.log(process.env);
    console.log('server listening on port ' + port);
});




