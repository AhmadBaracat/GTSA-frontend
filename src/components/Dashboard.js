import React from "react";
import { NFTStorage } from "nft.storage/dist/bundle.esm.min.js";
import constants from "../constants.json";
import { ethers } from "ethers";
import ABIArtifact from "../contract_config/abi.json";
import AddressArtifact from "../contract_config/address.json";
const csv = require("jquery-csv");
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;
var currentOutputId;
var currentCSVFileId;
var currentAssetsDirId;
var currentAttributeNameId;

function alertAndExit(msg) {
  alert(msg);
  return;
}

function log(msg) {
  console.log(msg);
  let outputText = document.getElementById(currentOutputId);
  outputText.insertAdjacentText("beforeend", msg + "\n\n");
}

function changeState(changeMetadata) {
  if (changeMetadata) {
    currentOutputId = "outputLogMetadata";
    currentCSVFileId = "CSVFileInputMetadata";
    currentAssetsDirId = "AssetsDirMetadata";
    currentAttributeNameId = "attributeNameInputMetadata";
  } else {
    currentOutputId = "outputLog";
    currentCSVFileId = "CSVFileInput";
    currentAssetsDirId = "AssetsDir";
    currentAttributeNameId = "attributeNameInput";
  }
}

async function getTokenPropertiesArrays() {
  let file = document.getElementById(currentCSVFileId).files[0];
  let data = await file.text();
  return csv.toArrays(data);
}

async function getTokenPropertiesObjects() {
  let file = document.getElementById(currentCSVFileId).files[0];
  let data = await file.text();
  return csv.toObjects(data);
}

async function processMintNewTokensFile(changeMetadata) {
  changeState(changeMetadata);
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

  log(
    "Checking for the existance of multiplier attribute name in .csv file..."
  );
  let attributeNameInput = document.getElementById(currentAttributeNameId);
  let attributeName = attributeNameInput.value;
  if (!attributes.includes(attributeName)) {
    alertAndExit(
      "The chosen .csv file doesn't contain the specified attribute name"
    );
  }
}

function extractAttributes(tokenProperty) {
  var result = {};
  for (const [key, value] of Object.entries(tokenProperty)) {
    if (key.includes("attr_")) {
      result[key.replace("attr_", "")] = value;
    }
  }
  return result;
}

function getContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const contract = new ethers.Contract(
    AddressArtifact.address,
    ABIArtifact.abi,
    provider.getSigner(0)
  );

  console.log(contract);
  return contract;
}

function areIdsUnique(tokenProperties) {
  var ids = new Set();
  for (const tokenProperty of tokenProperties) {
    const tokenId = parseInt(tokenProperty["id"]);
    if (ids.has(tokenId)) {
      return false;
    }

    ids.add(tokenId);
  }
  return true;
}

async function mintNewTokens(changeMetadata) {
  changeState(changeMetadata);
  // log("Minting new tokens...");
  const client = new NFTStorage({ token: constants.NFT_STORAGE_KEY });
  let tokenProperties = await getTokenPropertiesObjects();
  let assetsFiles = document.getElementById(currentAssetsDirId).files;
  console.log(assetsFiles);
  if (!areIdsUnique(tokenProperties)) {
    log("🚨 🚨 Ids are not unique please check the uploaded .csv file 🚨 🚨 ");
    return;
  }
  let attributeNameInput = document.getElementById(currentAttributeNameId);
  let attributeName = attributeNameInput.value;
  var ids = [];
  var multipliers = [];
  var metadataURIs = [];
  for (const tokenProperty of tokenProperties) {
    const tokenId = parseInt(tokenProperty["id"]);
    const tokenName = tokenProperty["name"] + ` #${tokenId}`;
    log(`Processing token: ${tokenName}`);
    const fileName = tokenProperty["image"]
      ? tokenProperty["image"]
      : tokenProperty["animation_url"];
    console.log(fileName);
    var file;
    for (const asset of assetsFiles) {
      if (asset["name"] === fileName) {
        file = asset;
        break;
      }
    }
    console.log(file);
    const image = new File([file], fileName);
    const attributes = extractAttributes(tokenProperty);
    console.log(attributes);
    const nft = {
      image,
      name: tokenName,
      description: "GTSA Gold Token",
      properties: attributes,
    };
    const metadataURI = await client.store(nft);
    ids.push(tokenId);
    multipliers.push(attributes[attributeName]);
    metadataURIs.push(metadataURI.url);
    log(`NFT data stored!, Metadata URI: ${metadataURI.url}`);
  }

  console.log(ids);
  console.log(metadataURIs);

  const contract = getContract();
  const [selectedAddress] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  try {
    log("Sending transaction to the smart contract...");
    const owner = selectedAddress;
    var tx;
    if (changeMetadata) {
      tx = await contract.changeMetadata(ids, multipliers, metadataURIs);
    } else {
      tx = await contract.mintTokens(owner, ids, multipliers, metadataURIs);
    }

    const receipt = await tx.wait();

    if (receipt.status === 0) {
      throw new Error("Transaction failed");
    }
    log("Transaction succeeded");
  } catch (error) {
    if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
      return;
    }
    log("Transaction failed");
    log(error);
    console.error(error);
  }

  log("✅ Done 💪");
}

async function testTransaction() {
  const contract = getContract();
  console.log(contract);

  const [selectedAddress] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  try {
    const owner = selectedAddress;
    const ids = [13];
    const metadataURIs = [
      "ipfs://bafyreighotohztyiupnonveam4ajthdg75j6oqylikzkiamfe3qvb7dwxy/metadata.json",
    ];
    // const tx = await contract.mintTokens(owner, ids, metadataURIs);
    const tx = await contract.changeMetadata(ids[0], metadataURIs[0]);
    const receipt = await tx.wait();

    if (receipt.status === 0) {
      throw new Error("Transaction failed");
    }
    log("Minted");
  } catch (error) {
    if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
      return;
    }
    console.error(error);
  }
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
              properties values. Token ids should be unique.
            </p>
            <div className="mt-3">
              <h4>Choose the .csv file</h4>
              <input type="file" name="file" id="CSVFileInput"></input>
            </div>
            <div className="mt-3">
              <h4>Choose the directory for the assets</h4>
              <input
                directory=""
                webkitdirectory=""
                type="file"
                id="AssetsDir"
              />
            </div>
            <div className="mt-3">
              <label for="attributeNameInput">
                Name of attribute to be used as multiplier (ex: weight_in_g):
              </label>
              <br />
              <input
                type="text"
                id="attributeNameInput"
                name="Token attribute name"
                placeholder="weight_in_g"
              />
            </div>
            <div className="mt-3">
              <button onClick={() => processMintNewTokensFile(false)}>
                Process new tokens file
              </button>
            </div>
            <div className="mt-3">
              <button onClick={() => mintNewTokens(false)}>
                Mint new tokens
              </button>
            </div>
            {/* <div className="mt-3">
              <button onClick={() => testTransaction()}>testTransaction</button>
            </div> */}
          </div>
          <div className="col-6">
            <h2>Output</h2>
            <pre
              style={{
                height: "auto",
                "max-height": "300px",
                overflow: "auto",
                backgroundColor: "#f0f0f0",
              }}
              id="outputLog"
            ></pre>
          </div>
        </div>
        <h1 className="mt-5">Modify Metadata for Minted Tokens</h1>
        <div className="row">
          <div className="col-6">
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
              tokens already minted with all unique ids. This is to guarantee
              that we change the metadata for all assets already minted.
            </div>
            <div className="mt-3">
              <h4>Choose the .csv file</h4>
              <input type="file" name="file" id="CSVFileInputMetadata"></input>
            </div>
            <div className="mt-3">
              <h4>Choose the directory for the assets</h4>
              <input
                directory=""
                webkitdirectory=""
                type="file"
                id="AssetsDirMetadata"
              />
            </div>
            <div className="mt-3">
              <label for="attributeNameInputMetadata">
                Name of attribute to be used as multiplier (ex: weight_in_g):
              </label>
              <br />
              <input
                type="text"
                id="attributeNameInputMetadata"
                name="Token attribute name"
                placeholder="weight_in_g"
              />
            </div>
            <div className="mt-3">
              <button onClick={() => processMintNewTokensFile(true)}>
                Process new tokens file
              </button>
            </div>
            <div className="mt-3">
              <button onClick={() => mintNewTokens(true)}>
                Change metadata
              </button>
            </div>
          </div>
          <div className="col-6">
            <h2>Output</h2>
            <pre
              style={{
                height: "auto",
                "max-height": "300px",
                overflow: "auto",
                backgroundColor: "#f0f0f0",
              }}
              id="outputLogMetadata"
            ></pre>
          </div>
        </div>
      </div>
    </>
  );
}
