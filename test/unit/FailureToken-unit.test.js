const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FailureToken Unit Test", function () {
      //Multiplier is used to make reading the math easier because of the 18 decimal points
      const multiplier = 10 ** 18;
      let failureToken, deployer, user1;
      beforeEach(async function () {
        const accounts = await getNamedAccounts();
        deployer = accounts.deployer;
        user1 = accounts.user1;

        await deployments.fixture("all");
        failureToken = await ethers.getContract("FailureToken", deployer);
      });
      it("was deployed", async () => {
        assert(failureToken.address);
      });
      describe("constructor", () => {
        it("Should have correct INITIAL_SUPPLY of token ", async () => {
          const totalSupply = await failureToken.totalSupply();
          assert.equal(totalSupply.toString(), INITIAL_SUPPLY);
        });
        it("initializes the token with the correct name and symbol ", async () => {
          const name = (await failureToken.name()).toString();
          assert.equal(name, "FailureToken");

          const symbol = (await failureToken.symbol()).toString();
          assert.equal(symbol, "FAIL");
        });
      });
      describe("transfers", () => {
        it("should be able to transfer tokens successfully to an address", async () => {
          const tokensToSend = ethers.utils.parseEther("10");
          await failureToken.transfer(user1, tokensToSend);
          expect(await failureToken.balanceOf(user1)).to.equal(tokensToSend);
        });
        it("emits an transfer event, when an transfer occurs", async () => {
          await expect(
            failureToken.transfer(user1, (10 * multiplier).toString())
          ).to.emit(failureToken, "Transfer");
        });
      });
      describe("allowances", () => {
        const amount = (20 * multiplier).toString();
        beforeEach(async () => {
          playerToken = await ethers.getContract("FailureToken", user1);
        });
        it("Should approve other address to spend token", async () => {
          const tokensToSpend = ethers.utils.parseEther("5");
          await failureToken.approve(user1, tokensToSpend);
          const failureToken1 = await ethers.getContract("FailureToken", user1);
          await failureToken1.transferFrom(deployer, user1, tokensToSpend);
          expect(await failureToken1.balanceOf(user1)).to.equal(tokensToSpend);
        });
        it("doesn't allow an unapproved member to do transfers", async () => {
          //Deployer is approving that user1 can spend 20 of their precious OT's

          await expect(
            playerToken.transferFrom(deployer, user1, amount)
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
        it("emits an approval event, when an approval occurs", async () => {
          await expect(failureToken.approve(user1, amount)).to.emit(
            failureToken,
            "Approval"
          );
        });
        it("the allowance being set is accurate", async () => {
          await failureToken.approve(user1, amount);
          const allowance = await failureToken.allowance(deployer, user1);
          assert.equal(allowance.toString(), amount);
        });
        it("won't allow a user to go over the allowance", async () => {
          await failureToken.approve(user1, amount);
          await expect(
            playerToken.transferFrom(
              deployer,
              user1,
              (40 * multiplier).toString()
            )
          ).to.be.revertedWith("ERC20: insufficient allowance");
        });
      });
    });
