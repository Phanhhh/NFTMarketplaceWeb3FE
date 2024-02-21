import React, { useState, useEffect, useContext} from 'react';
import web3Modal from 'web3-modal';
import { ethers} from "ethers";
import Router from "next/router";

//INTERNAL IMPORT
import {NFTMarketplaceAddress, NFTMarketplaceABI} from "./constants";

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = (({children}) => {

    return (
        <NFTMarketplaceContext.Provider value={{}}>
            {children}
        </NFTMarketplaceContext.Provider>
    )
})