import React from "react";

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
            <button>Upload .csv file</button>
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-12">
            <h1>Modify Metadata for Minted Tokens</h1>
            <p>
              Upload a .csv file to specify the number of NFTs to be minted as
              well as the metadata properties.Column names dictate the name of
              the properties. Each row will be a single NFT and its associated
              properties values.
            </p>
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
