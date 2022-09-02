import { expect } from "chai";
import { ethers, waffle } from "hardhat";
import { ERC20 } from "../typechain/ERC20";
import { ERC20__factory } from "../typechain/factories/ERC20__factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { parseEther } from "ethers/lib/utils";

const { provider } = waffle;

describe("erc20", function () {
  let token: ERC20;
  const [wallet] = provider.getWallets();
  let signers: SignerWithAddress[];

  before(async function () {
    signers = await ethers.getSigners();
    const deployer = new ERC20__factory(signers[0]);
    token = await deployer.deploy("token", "TKN");
  });
  

  describe("transfer functionality", async () => {

    before("mint", async () => {
      await token.mint(signers[0].address, ethers.utils.parseEther("100"));
    })

    it("transfers successfully", async () => {
      await token.transfer(signers[1].address, ethers.utils.parseEther("5"));
      expect(await token.balanceOf(signers[0].address)).to.be.eq(
        ethers.utils.parseEther("95")
      );
      expect(await token.balanceOf(signers[1].address)).to.be.eq(
        ethers.utils.parseEther("5")
      );
    });

    it("does not transfer more than balance", async () => {
      const tx = token.transfer(
        signers[1].address,
        ethers.utils.parseEther("500")
      );
      await expect(tx).to.be.revertedWith("ERC20: insufficient-balance");
    });    
  });
  
  // test transferform function
  describe("transferFrom functionality test", async () => {
    // before("mint",async () => {
    //   await token.mint(signers[0].address, ethers.utils.parseEther("100"));
    // })

    it("transferFrom when signer is spender", async () => {
      // token remaining on sender = 95 - 1 = 94
      await token.transferFrom(signers[0].address, signers[1].address, ethers.utils.parseEther("1"))
      expect(await token.balanceOf(signers[0].address)).to.be.eq(
        ethers.utils.parseEther("94")
      );
      // token remaining on receiver = 5 + 1 = 6
      expect(await token.balanceOf(signers[1].address)).to.be.equal(
        ethers.utils.parseEther("6")
      );
    })

    it("when try to transfer more than balance", async () => {
      const tx = token.transferFrom(
        signers[0].address, signers[1].address, ethers.utils.parseEther("200")
      )
      await expect(tx).to.be.revertedWith("ERC20: insufficient-balance");
    })

    it("if signer is not token spender and spender is approved from signer", async () => {
      await (await token.approve(signers[2].address, ethers.utils.parseEther("10"))).wait()
      await (await token.connect(signers[2]).transferFrom(signers[0].address, signers[3].address, ethers.utils.parseEther("10"))).wait()
      expect(await token.balanceOf(signers[3].address)).to.be.equal(ethers.utils.parseEther("10"))
    })

    it("if signer is not token spender and spender is not approved", async () => {
      let tx = token.connect(signers[2]).transferFrom(signers[0].address, signers[3].address, ethers.utils.parseEther("10"))
      await expect(tx).to.be.revertedWith("ERC20: insufficient-allowance")
    })

    it("if allowance is not enough", async() => {
      await (await token.approve(signers[2].address, ethers.utils.parseEther("10"))).wait()
      let tx = token.connect(signers[2]).transferFrom(signers[0].address, signers[3].address, ethers.utils.parseEther("20"))
      await expect(tx).to.be.revertedWith("ERC20: insufficient-allowance")
    })
  });

  // test transferfrom function on uint256 max value
  describe("transferFrom functionality on unit256 max value test", async () => {
    before("uint256 max value mint", async () => {
      await token.mint(signers[0].address, ("115792089237316195423570985008687907853269984665640564039357584007913129639935"));
    })
    it("if allowance is bigger than 2**256 - 1 max uint256 value", async () => {
      await (await token.approve(signers[2].address, ("115792089237316195423570985008687907853269984665640564039357584007913129639935"))).wait()
      let tx = token.connect(signers[2]).transferFrom(signers[0].address, signers[3].address, ("115792089237316195423570985008687907853269984665640564039357584007913129639936"))
      await expect(tx).to.be.revertedWith("ERC20: insufficient-allowance")

    })
  })

  // test approve function
  describe("approve functionality", async () => {
    // before("uint256 max value mint", async () => {
    //   await token.mint(signers[0].address, ethers.utils.parseEther("100"));
    // })
    it("approved successfully", async () => {

      await (await token.approve(signers[4].address, ethers.utils.parseEther("10"))).wait()
      let allowance = await token.connect(signers[4]).allowance(signers[0].address, signers[4].address)
      // console.log("allowance", ethers.utils.parseEther("10"))
      // console.log("ethers", allowance)
      expect(allowance).to.be.eq(ethers.utils.parseEther("10"));

    })
  });
});
