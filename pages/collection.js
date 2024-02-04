import React from 'react';

//INTERNAL IMPORT
import Style from "../styles/collection.module.css";
import images from "../image";
import {
  CollectionProfile,
  NFTCardTwo,
} from "../collectionPage/collectionIndex";
import { Slider, Brand } from "../components/componentsindex";
import Filter from "../components/Filter/Filter";

const collection = () => {
  const collectionArray = [
    images.nft_image_1,
    images.nft_image_2,
    images.nft_image_3,
    images.nft_raccoon_1,
    images.nft_raccoon_2,
    images.nft_raccoon_3,
    images.nft_cat_4,
    images.nft_fox_2,
    images.nft_ape_5,
  ];
  return (
    <div className={Style.collection}>
      <CollectionProfile />
      <Filter />
      <NFTCardTwo NFTData={collectionArray} />

      <Slider />
      <Brand />
    </div>
  )
};

export default collection;