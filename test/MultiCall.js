const {expect} = require("chai");
const {ethers, network} = require("hardhat");
require("dotenv").config();

const UniswapV2Router02 = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json");
const ERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const {inputToConfig} = require("@ethereum-waffle/compiler");

const IERC20 = new ethers.utils.Interface(JSON.stringify(ERC20.abi));
const IUniswapV2Router02 = new ethers.utils.Interface(JSON.stringify(UniswapV2Router02.abi));

const sRouter = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
const uRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const CGT = "0xF5238462E7235c7B62811567E63Dd17d12C2EAA0";
const TOKE = "0x2e9d63788249371f1DFC918a52f8d799F4a38C94";

const WETH_WHALE = "0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3";

describe("MultiCall", function () {
  let multiCall;
  let uniswap, sushiswap;
  let token0, token1, token2;
  let owner;

  beforeEach(async () => {
    // Set current forked block number
    beforeEach(async function () {
      await network.provider.request({
        method: "hardhat_reset",
        params: [
          {
            forking: {
              jsonRpcUrl: process.env.FORKED_MAINNET_RPC,
              blockNumber: 14398652,
            },
          },
        ],
      });
    });

    // Fetch & deploy contracts
    const MultiCall = await ethers.getContractFactory("MultiCall");
    multiCall = await MultiCall.deploy();

    // Fetch owner account
    const accounts = await ethers.getSigners();
    owner = accounts[0];

    //Establish router accounts
    uniswap = new ethers.Contract(uRouter, UniswapV2Router02.abi, owner);
    sushiswap = new ethers.Contract(sRouter, UniswapV2Router02.abi, owner);

    // Establish token contracts
    token0 = new ethers.Contract(WETH, ERC20.abi, owner);
    token1 = new ethers.Contract(CGT, ERC20.abi, owner);
    token2 = new ethers.Contract(TOKE, ERC20.abi, owner);

    //Unlock an account with WETH
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3"],
    });

    // Transfer WETH to our address
    const signer = await ethers.getSigner("0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3");
    const amount = ethers.utils.parseUnits("0.75", "ether");
    let tx = await token0.connect(signer).transfer(owner.address, amount);
    await tx.wait();
  });

  describe("Deploments", () => {
    it("Tracks the owner", async () => {
      console.log(await token0.balanceOf("0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3"));
      expect(await multiCall.owner()).to.eq(owner.address);
    });
  });
});
