import React, { useState, useEffect } from "react";
import Wenb3Modal from "web3modal";
import { ethers } from "ethers";
//process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL

//INTERNAL IMPORT
import { CrowdFundingABI, CrowdFundingAddress } from "./contants";

//---FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) => 
    new ethers.Contract(CrowdFundingAddress, CrowdFundingABI, signerOrProvider);

export const CrowdFundingContext = React.createContext();

export const CrowdFundingProvider = ({ children }) => {
    const titleData = "Crowd Funding Contract";
    const [currentAccount, setCurrentAccount] = useState("");

    const createCampaign = async (campaign) => {
        const { title, description, amount, deadline } = campaign;
        const web3Modal = new Wenb3Modal();
        const connection = await web3Modal.connect();
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);

        console.log(currentAccount);
        try{
            const transaction = await contract.createCampaign(
                currentAccount, //owner
                title,// title
                description, //description
                ethers.utils.parseUnits(amount, 18),
                new Date(deadline).getTime() //deadline
            );

            await transaction.wait();

            console.log("contract call success", transaction);

        } catch (error) {
            console.log("contract call failure", error);
        }
    };

    const getCampaigns = async () => {
     const provider = new ethers.providers.JsonRpcProvider();
     const contract = fetchContract(provider);

     const campaigns = await contract.getCampaigns();

     const parsedCampaigns = campaigns.map( (campaign, i) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: campaign.deadline.toNumber(),
        amountCollected: ethers.utils.formatEther(
            campaign.amountCollected.toString()
        ),
        pId: i,

     }));

     return parsedCampaigns;
    };
    

    const getUserCampaigns = async () => {
        const provider = new ethers.providers.JsonRpcProvider();
        const contract = fetchContract(provider);

        const allCampaigns = await contract.getCampaigns();

        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });
        const currentUser = accounts[0];
        if (!currentUser) {
            console.error("No connected Ethereum account found.");
            return [];
        }

        const filteredCampaigns = allCampaigns.filter(
            (campaign) =>
                // campaign.owner === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
                 campaign.owner.toLowerCase() === currentUser.toLowerCase()
        );

        const userData = filteredCampaigns.map((campaign, i) => ({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: ethers.utils.formatEther(campaign.target.toString()),
            deadline: campaign.deadline.toNumber(),
            amountCollected: ethers.utils.formatEther(
                campaign.amountCollected.toString()
            ),
            pId: i,
        }));

        return userData;

    };

     

    // const getUserCampaigns = async () => {
    //     try {
    //         const provider = new ethers.providers.JsonRpcProvider();
    //         const contract = fetchContract(provider);
    
    //         // Get current account properly
    //         const accounts = await window.ethereum.request({
    //             method: "eth_requestAccounts", // Changed from eth_accounts to ensure account is available
    //         });
            
    //         if (!accounts || accounts.length === 0) {
    //             console.error("No accounts found");
    //             return [];
    //         }
    
    //         const currentUser = ethers.utils.getAddress(accounts[0]); // Normalize the address
    //         console.log("Current user address:", currentUser);
    
    //         const allCampaigns = await contract.getCampaigns();
    
    //         const filteredCampaigns = allCampaigns.filter(campaign => {
    //             try {
    //                 // Normalize campaign owner address for comparison
    //                 const ownerAddress = ethers.utils.getAddress(campaign.owner);
    //                 return ownerAddress === currentUser;
    //             } catch (error) {
    //                 console.error("Error processing campaign owner address:", error);
    //                 return false;
    //             }
    //         });
    
    //         const userData = filteredCampaigns.map((campaign, i) => ({
    //             owner: campaign.owner,
    //             title: campaign.title,
    //             description: campaign.description,
    //             target: ethers.utils.formatEther(campaign.target.toString()),
    //             deadline: campaign.deadline.toNumber(),
    //             amountCollected: ethers.utils.formatEther(
    //                 campaign.amountCollected.toString()
    //             ),
    //             pId: i,
    //         }));
    
    //         return userData;
    //     } catch (error) {
    //         console.error("Error in getUserCampaigns:", error);
    //         return [];
    //     }
    // };



    


    const donate = async (pId, amount) => {
        const web3Modal = new Wenb3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);

        const campaignData = await contract.donateToCampaign(pId, {
            value: ethers.utils.parseEther(amount),
        });

        await campaignData.wait();
        location.reload();

        return campaignData;
    };




    // const donate = async (pId, amount) => {
    //     try {
    //         const web3Modal = new Wenb3Modal();
    //         const connection = await web3Modal.connect();
    //         const provider = new ethers.providers.Web3Provider(connection);
    //         const signer = provider.getSigner();
    //         const contract = fetchContract(signer);
    
    //         console.log("Donating to campaign ID:", pId);
    
    //         const tx = await contract.donateToCampaign(pId, {
    //             value: ethers.utils.parseEther(amount),
    //         });
    
    //         console.log("Transaction Sent! Waiting for confirmation...", tx.hash);
    
    //         await tx.wait();
    //         console.log("Transaction Confirmed!", tx);
    
    //         return tx;
    //     } catch (error) {
    //         console.error("Donation failed:", error);
    //     }
    // };
    

    // const getDonations = async (pId) => {
    //     const provider = new ethers.providers.JsonRpcProvider();
    //     const contract = fetchContract(provider);

    //     const donations = await contract.getDonators(pId);
    //     const numberOfDonations = donations[0].length;

    //     const parsedDonations = [];

    //     for(let i=0; i < numberOfDonations; i++)
    //     {
    //         parsedDonations.push({
    //             donator: donations[0][i],
    //             donation: ethers.utils.formatEther(donations[1][i].toString()),
    //         });

    //     }
    //     return parsedDonations;
    // };


    const getDonations = async (pId) => {
        try {
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);
    
            const donations = await contract.getDonators(pId);
    
            // Check if donations exist
            if (!donations || donations.length < 2) {
                console.warn(`No donations found for campaign ${pId}`);
                return [];
            }
    
            const numberOfDonations = donations[0]?.length || 0;
    
            const parsedDonations = [];
    
            for (let i = 0; i < numberOfDonations; i++) {
                parsedDonations.push({
                    donator: donations[0][i],
                    donation: ethers.utils.formatEther(donations[1][i].toString()),
                });
            }
    
            return parsedDonations;
        } catch (error) {
            console.error(`Error fetching donations for campaign ${pId}:`, error);
            return [];
        }
    };
    
    
    //--CHECK IF WALLET IS CONNECTED
    const checkIfWalletConnected = async () => {
        try{
            if(!window.ethereum)
                return setOpenError(true), setError("Install MetaMask");

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
            } else {
                console.log("No Account Found");
            }
        } catch (error){
            console.log("Something wrong while connecting to wallet");
        }
    };

    useEffect(() => {
        checkIfWalletConnected();    
    }, []);

    //---CONNECT WALLET FUNCTION
    const connectWallet = async () => {
        try{
            if (!window.ethereum) return console.log("Install MetaMask");

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",

            });
            setCurrentAccount(accounts[0]);
        }catch (error) {
            console.log("Error while connecting to wallet");
        }
    };

    return (
        <CrowdFundingContext.Provider
          value={{
            titleData,
            currentAccount,
            createCampaign,
            getCampaigns,
            getUserCampaigns,
            donate,
            getDonations,
            connectWallet,
          }}
        >
            {children}
        </CrowdFundingContext.Provider>  
    );
};



