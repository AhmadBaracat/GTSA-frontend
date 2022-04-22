import React from "react";
import { NFTStorage } from "nft.storage/dist/bundle.esm.min.js";
import constants from "../constants.json";
const csv = require("jquery-csv");

function alertAndExit(msg) {
  alert(msg);
  return;
}

function log(msg) {
  console.log(msg);
  let outputText = document.getElementById("outputLog");
  outputText.insertAdjacentText("beforeend", msg + "\n\n");
}

async function getTokenPropertiesArrays() {
  let file = document.getElementById("mintNewTokensFileInput").files[0];
  let data = await file.text();
  return csv.toArrays(data);
}

async function getTokenPropertiesObjects() {
  let file = document.getElementById("mintNewTokensFileInput").files[0];
  let data = await file.text();
  return csv.toObjects(data);
}

async function processMintNewTokensFile() {
  log("Processing token properties file...");
  let tokenProperties = await getTokenPropertiesArrays();
  console.log(tokenProperties);
  if (tokenProperties.length < 2) {
    alertAndExit(
      "The chosen .csv file is too small, either missing the header row or only have a header row and no NFT data to mint"
    );
  }

  let header = tokenProperties[0];
  log(`Header columns: ${header}`);

  if (!(header.includes("image") || header.includes("animation_url"))) {
    alertAndExit(
      "The chosen .csv file contains neither an image or animation_url colums"
    );
  }

  let attributes = [];
  const attrPrefix = "attr_";
  header
    .filter((column) => column.includes(attrPrefix))
    .forEach((column) => attributes.push(column.replace(attrPrefix, "")));
  log(`Found ${attributes.length} attributes: ${attributes}`);
  log(`Found definition for ${tokenProperties.length - 1} tokens`);
  log("Press the Minting button to mint the new tokens 🚀 💪");
}

async function mintNewTokens() {
  log("Minting new tokens...");
  const client = new NFTStorage({ token: constants.NFT_STORAGE_KEY });
  let tokenProperties = await getTokenPropertiesObjects();
  let assets = document.getElementById("mintNewTokensAssetsInput").files;
  console.log(assets);
  for (const tokenProperty of tokenProperties) {
    console.log(tokenProperty);
    const fileName = tokenProperty["image"]
      ? tokenProperty["image"]
      : tokenProperty["animation_url"];
    console.log(fileName);
    var file;
    for (const asset of assets) {
      if (asset["name"] === fileName) {
        file = asset;
        break;
      }
    }
    console.log(file);
    // const image = await createNFTStorageFile(file);
    const image = new File([file], fileName);
    const nft = {
      image,
      name: fileName,
      description: "GTSA Gold Token",
    };
    const metadata = await client.store(nft);
    console.log("NFT data stored!");
    console.log("Metadata URI: ", metadata.url);
    // const imagePath = tokenProperty["image"];
    // if (imagePath) {
    //   console.log(imagePath);
    //   const image = await fileFromPath(imagePath);
    //   console.log(image);
    // }
  }
  // const image = await fileFromPath
  // const metadata = await client.store({
  //   description,
  //   image,
  // });
}

export function Dashboard() {
  return (
    <>
      <div className="container p-4">
        <h1>Mint New Tokens</h1>
        <div className="row">
          <div className="col-6">
            <p>
              Upload a .csv file to specify the number of NFTs to be minted as
              well as the metadata properties. Column names dictate the name of
              the properties. Each row will be a single NFT and its associated
              properties values.
            </p>
            <div className="mt-3">
              <h4>Choose the .csv file</h4>
              <input
                type="file"
                name="file"
                id="mintNewTokensFileInput"
              ></input>
            </div>
            <div className="mt-3">
              <h4>Choose the directory for the assets</h4>
              <input
                directory=""
                webkitdirectory=""
                type="file"
                id="mintNewTokensAssetsInput"
              />
            </div>
            <div className="mt-3">
              <button onClick={() => processMintNewTokensFile()}>
                Process new tokens file
              </button>
            </div>
            <div className="mt-3">
              <button onClick={() => mintNewTokens()}>Mint new tokens</button>
            </div>
          </div>
          <div className="col-6">
            <h2>Output</h2>
            <pre id="outputLog"></pre>
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-12">
            <h1>Modify Metadata for Minted Tokens</h1>
            <p>
              Upload a .csv file to specify the number of NFTs to be minted as
              well as the metadata properties. Column names dictate the name of
              the properties. Each row will be a single NFT and its associated
              properties values.
            </p>
            <div class="alert alert-warning" role="alert">
              There should be an id column to specify which NFT token to modify
            </div>
            <div class="alert alert-warning" role="alert">
              This .csv should have exactly N rows where N is the number of
              tokens already minted.
            </div>
            <button>Upload .csv file</button>
          </div>
        </div>
      </div>
    </>
  );
}
