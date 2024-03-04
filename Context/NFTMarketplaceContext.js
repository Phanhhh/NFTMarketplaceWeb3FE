import React, { useState, useEffect, useContext } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";

// const client = ipfsHttpClient("https://ipfs.infure.io:5001/api/v0");

const projectId = "4a33a6c99b484cf08b4763d503425e61";
const projectSecretKey =
  "s0dY/LWhM81D45O0rkqHWxo4cT+MJiesUZfuDOkmSW2YnaXLHqCFcg";

const auth = `Basic ${Buffer.from(`${projectId}:${projectSecretKey}`).toString(
  "base64"
)}`;

const subdomain = "your subdomain";

const client = ipfsHttpClient({
  host: "infura-ipfs.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

//INTERNAL IMPORT
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "./constants";

//FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplaceABI,
    signerOrProvider
  );

//CONNECTING WITH SMART CONTRACT
const connectingWithSmartContract = async () => {
  try {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    return contract;
  } catch (error) {
    console.log("Some thing went wrong while connecting with contract");
  }
};

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = ({ children }) => {
  //USE STATE
  const [currentAccount, setCurrentAccount] = useState("");

  const router = useRouter();

  //@dev: check if wallet is connected
  const checkIfWalletConnected = async () => {
    try {
      if (!window.ethereum) return console.log("Install Metamask");

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No Account Found");
      }

      console.log(currentAccount);
    } catch (error) {
      console.log("Something went wrong while connecting to wallet");
    }
  };

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  //@dev: connect wallet function
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return console.log("Install Metamask");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
      // window.location.reload();
    } catch (error) {
      console.log("Error while connecting to wallet");
    }
  };

  //@dev: Upload to IPFS function
  const uploadToIPFS = async (file) => {
    try {
      const added = await client.add({ content: file });
      const url = "${subdomain}/ipfs/${added.path}";

      return url;
    } catch (error) {
      console.log("Error while uploading to IPFS");
    }
  };

  //@dev: Create NFT function
  const createNFT = async (name, price, image, description, router) => {
    // const { name, description, price } = formInput;

    if (!name || !description || !price || !image)
      return console.log("Data Is Missing");

    const data = JSON.stringify({ name, description, image });

    try {
      const added = await client.add(data);

      const url = "https://infura-ipfs.io/ipfs/${added.path}";

      await createSale(url, price);
    } catch (error) {
      console.log("Error while creating NFT");
    }
  };

  //@dev: createSale function
  const createSale = async (url, formInputPrice, isReselling, id) => {
    try {
      const price = ethers.utils.parseUnits(formInputPrice, "ether");
      const contract = await connectingWithSmartContract();

      const listingPrice = await contract.getListingPrice();

      const transaction = !isReselling
        ? contract.createToken(url, price, { value: listingPrice.toString() })
        : await contract.reSellToken(url, price, {
            value: listingPrice.toString(),
          });

      await transaction.wait();
      router.push("/searchPage");
    } catch (error) {
      console.log("Error while creating sale");
    }
  };

  //@dev: fetchNFT function
  const fetchNFTs = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);

      const data = await contract.fetchMarketItem();
      // console.log(data);

      const items = await Promise.all(
        data.map(
          async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await contract.tokenURI(tokenId);

            const {
              data: { image, name, description },
            } = await axios.get(tokenURI);

            const price = ethers.utils.formatUnits(
              unformattedPrice.toString(),
              "ether"
            );

            return {
              price,
              tokenId: tokenId.toNumber(),
              seller,
              owner,
              image,
              name,
              description,
              tokenURI,
            };
          }
        )
      );

      return items;
    } catch (error) {
      console.log("Error while fetching NFTs");
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  //@dev: Fetching my NFTs or listed NFTs
  const fetchMyNFTsOrListedNFTs = async (type) => {
    try {
      const contract = await connectingWithSmartContract();

      const data =
        type == "fetchItemListed"
          ? await contract.fetchItemListed()
          : await contract.fetchMyNFT();

      const items = await Promise.all(
        data.map(
          async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await contract.tokenURI(tokenId);

            const {
              data: { image, name, description },
            } = await axios.get(tokenURI);

            const price = ethers.utils.formatUnits(
              unformattedPrice.toString(),
              "ether"
            );

            return {
              price,
              tokenId: tokenId.toNumber(),
              seller,
              owner,
              image,
              name,
              description,
              tokenURI,
            };
          }
        )
      );

      return items;
    } catch (error) {
      console.log("Error while fetching listed NFTs");
    }
  };

  //@dev: Buy NFTs function
  const buyNFT = async (nft) => {
    try {
      const contract = await connectingWithSmartContract();
      const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price,
      });

      await transaction.wait();
    } catch (error) {
      console.log("Error while buying NFT");
    }
  };

  //----------------------------------------------------------------//
  return (
    <NFTMarketplaceContext.Provider
      value={{
        checkIfWalletConnected,
        connectWallet,
        uploadToIPFS,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
        currentAccount,
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
