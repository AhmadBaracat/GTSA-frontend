import React from "react";
var csv = require("jquery-csv");

async function handleMintNewTokensFileUpload() {
  console.log("Handling Mint New Tokens .csv upload...");
  let file = document.getElementById("mintNewTokensFileInput").files[0];
  console.log(file);
  let data = await file.text();
  let arrays = csv.toArrays(data);
  console.log(arrays);
  if (arrays.length < 2) {
    alert(
      "The chosen .csv file is too small, either missing the header row or only have a header row and no NFT data to mint"
    );
    return;
  }
}

export function Dashboard() {
  return (
    <>
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>Mint New Tokens</h1>
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
            <button
              className="mt-3"
              onClick={() => handleMintNewTokensFileUpload()}
            >
              Mint new tokens
            </button>
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
