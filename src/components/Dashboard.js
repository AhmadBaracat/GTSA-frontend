import React from "react";
var csv = require("jquery-csv");

function alertAndExit(msg) {
  alert(msg);
  return;
}

function log(msg) {
  console.log(msg);
  let outputText = document.getElementById("outputLog");
  outputText.insertAdjacentText("beforeend", msg + "\n\n");
}

async function processMintNewTokensFile() {
  log("Handling Mint New Tokens .csv upload...");
  let file = document.getElementById("mintNewTokensFileInput").files[0];
  let data = await file.text();
  let arrays = csv.toArrays(data);
  console.log(arrays);
  if (arrays.length < 2) {
    alertAndExit(
      "The chosen .csv file is too small, either missing the header row or only have a header row and no NFT data to mint"
    );
  }

  let header = arrays[0];
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
  log(`Found definition for ${arrays.length - 1} tokens`);
  log("Press the Minting button to mint the new tokens 🚀 💪");
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
            <div>
              <input
                type="file"
                name="file"
                id="mintNewTokensFileInput"
              ></input>
            </div>
            <div>
              <button
                className="mt-3"
                onClick={() => processMintNewTokensFile()}
              >
                Process new tokens file
              </button>
            </div>
            <div>
              <button
                className="mt-3"
                onClick={() => processMintNewTokensFile()}
              >
                Mint new tokens
              </button>
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
