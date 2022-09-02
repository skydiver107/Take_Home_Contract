import { expect } from "chai";
import { ethers, waffle } from "hardhat";
import { ERC20 } from "../typechain/ERC20";
import { ERC20__factory } from "../typechain/factories/ERC20__factory";
import { GrantFund__factory } from "../typechain/factories/GrantFund__factory";
import { GrantFund } from "../typechain/GrantFund";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { parseEther } from "ethers/lib/utils";

const { provider } = waffle;

describe("GrantFund", function () {
    let token: ERC20;
    let grantFund: GrantFund;
    const [wallet] = provider.getWallets();
    let signers: SignerWithAddress[];  
    before(async function () {
      signers = await ethers.getSigners();
      const tokenDeployer = new ERC20__factory(signers[0]);
      token = await tokenDeployer.deploy("token", "TKN");
      const deployer = new GrantFund__factory(signers[0]);
      grantFund = await deployer.deploy(token.address);
      await (await token.mint(signers[0].address, ethers.utils.parseEther("100"))).wait();
    });

    describe("test deposit functionality", async () => {
        it("deposit test",async () => {
            await (await token.approve(grantFund.address, ethers.utils.parseEther("10"))).wait()
            await grantFund.deposit(signers[1].address, ethers.utils.parseEther("10"), 300)
            // console.log("tx is: ", grantFund.connect(signers[0]).grantFund())
        })
    })  

    describe("test unlock functionality", async () => {
        it("unlock test", async () => {
            // const timestamp = 0;
            const tx = await grantFund.grantFund(signers[0].address, 0)
            await (await token.approve(grantFund.address, ethers.utils.parseEther("10"))).wait()
            await grantFund.deposit(signers[0].address, ethers.utils.parseEther("10"), 300)
            console.log("tx is", tx.timestamp)
            const testUnlock = grantFund.unlock(signers[0].address, 0, signers[1].address)
            // await expect(testUnlock).to.be.revertedWith("You cannot claim funds before timestamp!")

        })
    })

    describe("test remove functionality", async () => {
        it("remove test", async () => {
            const testRemove = grantFund.remove(0);
            await expect(testRemove).to.be.revertedWith("revert funds should be unlocked")
        })
    })


});