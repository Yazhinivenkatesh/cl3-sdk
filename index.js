import {
    CosmWasmClient,
    SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import axios from "axios";
export class CL3 {
    constructor(provider, walletAddress) {

        this.initialize = (async () => {
            this.provider = provider;
            this.walletAddress = walletAddress;
            this.stdFee = {
                amount: [
                    {
                        denom: "calib",
                        amount: "222500",
                    },
                ],
                gas: "80000000",
            };
            await this.provider.keplr.enable("calibchain");
            this.offlineSigner = this.provider.getOfflineSigner("calibchain");
            this.options = {
                gasprice: new GasPrice(10, "calib"),
            };
            this.tmClient = await Tendermint34Client.connect("http://localhost:26657");
            this.client = await CosmWasmClient.connect("http://localhost:26657");
            this.cwClient = new SigningCosmWasmClient(this.tmClient, this.offlineSigner, this.options);
            return this;
        })();
    }

    async contractDeployment(contract_name, params) {
        try{
            const response = await axios.post('http://localhost:9000/deploy', {contract_name, params})
            return response.data;
        }catch(err){
            return err;
        }
    }

    async addPlan(planName, price, cl3ContractAddress) {
        const init = await this.initialize;
        const response = await init.cwClient.execute(
            init.walletAddress,
            cl3ContractAddress,
            { add_plan: { name: planName, price: price } },
            init.stdFee
        );
        return response;
    }

    async addReferral(referrer, cl3ContractAddress) {
        const init = await this.initialize;
        const response = await init.cwClient.execute(
            init.walletAddress,
            cl3ContractAddress,
            { add_referral: { referrer: referrer } },
            init.stdFee
        );
        return response;
    }

    async payReferral(planName, cl3ContractAddress) {
        const init = await this.initialize;
        const response = await init.cwClient.execute(
            init.walletAddress,
            cl3ContractAddress,
            { pay_referral: { plan_name: planName } },
            init.stdFee
        );
        return response;
    }

    async payUplines(planName, cl3ContractAddress) {
        const init = await this.initialize;
        const response = await init.cwClient.execute(
            init.walletAddress,
            cl3ContractAddress,
            { pay_uplines: { plan_name: planName } },
            init.stdFee
        );
        return response;
    }

    async buyTokens(amount, cl3ContractAddress) {
        const init = await this.initialize;
        const response = await init.cwClient.execute(
            init.walletAddress,
            cl3ContractAddress,
            { buy_tokens: { amount_to_buy: amount } },
            init.stdFee
        );
        return response;
    }

    async getReferralDetail(walletAddress, cl3ContractAddress) {
        await this.initialize;
        const response = await this.client.queryContractSmart(cl3ContractAddress, { "get_referral_info": { "address": walletAddress } })
        return response;
    }

    async getAllReferralDetails(cl3ContractAddress) {
        await this.initialize;
        const response = await this.client.queryContractSmart(cl3ContractAddress, { "get_all_referral_datas": {} })
        return response;
    }

    async getPlanDetail(planName, cl3ContractAddress) {
        await this.initialize;
        const response = await this.client.queryContractSmart(cl3ContractAddress, { "plan_detail": { "name": planName } })
        return response;
    }

    async getAllPlanDetails(cl3ContractAddress) {
        await this.initialize;
        const response = await this.client.queryContractSmart(cl3ContractAddress, { "get_all_plans": {} })
        return response;
    }

    async getPaymentStatus(walletAddress, cl3ContractAddress) {
        await this.initialize;
        const response = await this.client.queryContractSmart(cl3ContractAddress, { "get_payment_status": { "address": walletAddress } })
        return response;
    }

    async getLevelDetails(walletAddress, levelCount, cl3ContractAddress) {
        await this.initialize;
        const response = await this.client.queryContractSmart(cl3ContractAddress, { "get_level_detail": { "address": walletAddress, "level_count": levelCount } })
        return response;
    }

    async allowance(owner, spender, tokenContractAddress) {
        await this.initialize;
        const response = await this.client.queryContractSmart(tokenContractAddress, { "allowance": { "owner": owner, "spender": spender } });
        return response;
    }

    async setAllowance(spender, amount, tokenContractAddress) {
        const init = await this.initialize;
        const response = await init.cwClient.execute(
            init.walletAddress,
            tokenContractAddress,
            {
                increase_allowance: {
                    spender: spender,
                    amount: amount,
                },
            },
            init.stdFee
        );
        return response;
    }
}


