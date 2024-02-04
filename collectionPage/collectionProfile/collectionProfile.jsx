import React from 'react';
import Image from "next/image";
import {
  TiSocialFacebook,
  TiSocialLinkedin,
  TiSocialTwitter,
  TiSocialInstagram,
} from "react-icons/ti";

//INTERNAL IMPORT
import Style from "./collectionProfile.module.css";
import images from "../../image";

const collectionProfile = () => {
    const cardArray = [1, 2, 3, 4];
    return (
      <div className={Style.collectionProfile}>
        <div className={Style.collectionProfile_box}>
          <div className={Style.collectionProfile_box_left}>
            <Image
              src={images.nft_image_1}
              alt="nft image"
              layout='responsive'
              width={800}
              height={800}
              className={Style.collectionProfile_box_left_img}
            />
  
            <div className={Style.collectionProfile_box_left_social}>
              <a href="#">
                <TiSocialFacebook />
              </a>
              <a href="#">
                <TiSocialInstagram />
              </a>
              <a href="#">
                <TiSocialLinkedin />
              </a>
              <a href="#">
                <TiSocialTwitter />
              </a>
            </div>
          </div>
  
          <div className={Style.collectionProfile_box_middle}>
            <h1>Awesome NFTs Collection</h1>
            <p>
              HeyGirl is home to 5,555 generative arts where colors reign
              supreme. This is the big NFTs which you want.
            </p>
  
            <div className={Style.collectionProfile_box_middle_box}>
              {cardArray.map((el, i) => (
                <div
                  className={Style.collectionProfile_box_middle_box_item}
                  key={i + 1}
                >
                  <small>Floor price</small>
                  <p>${i + 1}80,4554</p>
                  <span>+ {i + 2}.11%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

export default collectionProfile