"use client";

import { FormEvent, useEffect, useState } from "react";
import type { NextPage } from "next";
import { parseAbi, zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
// import diamondIcon from "~~//public/diamond.svg";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import greenRhombus from "~~/public/rhombus-green.png";

// import instagramIcon from "~~/public/social-icons/instagram.png";
// import linkedinIcon from "~~/public/social-icons/linkedin.png";
// import nounspaceIcon from "~~/public/social-icons/noggles.png";
// import warpcastIcon from "~~/public/social-icons/warpcast.png";
// import xIcon from "~~/public/social-icons/x.png";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();

  const { writeContractAsync: writeUserAsync } = useScaffoldWriteContract("UserProfile");
  const { data: profile } = useScaffoldReadContract({
    contractName: "UserProfile",
    functionName: "getUser",
    args: [connectedAddress],
  });

  const [tokenUri, setTokenUri] = useState<string>();

  useEffect(() => {
    getUserTokenUri();
  }, [profile?.erc721Collection, profile?.profilePicTokenId]);
  async function getUserTokenUri() {
    if (profile === undefined) return;
    if (profile?.erc721Collection === zeroAddress) return;

    const result = await publicClient?.readContract({
      abi: parseAbi(["function tokenURI(uint256 tokenId) view returns (string)"]),
      address: profile?.erc721Collection,
      functionName: "tokenURI",
      args: [profile?.profilePicTokenId],
    });

    setTokenUri(result);
  }
  console.log(tokenUri);

  const [metadata, setMetadata] = useState<any>();

  useEffect(() => {
    async function get() {
      if (tokenUri === undefined) return;

      const cleanUrl = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const resultJson = await fetch(cleanUrl);
      const result = await resultJson.json();
      result.image = result.image.replace("ipfs://", "https://ipfs.io/ipfs/");
      setMetadata(result);
    }
    get();
  }, [tokenUri]);
  console.log(metadata);

  const [image, setImage] = useState<string>();

  useEffect(() => {
    setImage(metadata?.image.replace("ipfs://", "https://ipfs.io/ipfs/"));
  }, [metadata?.image]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const collectionAddress: `0x${string}` = formData.get("collectionAddress")!.toString() as `0x${string}`;
    const tokenId = BigInt(Number(formData.get("tokenId")!));

    await writeUserAsync({
      functionName: "setProfilePicTokenId",
      args: [collectionAddress, tokenId],
    });
  }

  // async function onSubmit2(event: FormEvent<HTMLFormElement>) {
  //   event.preventDefault();

  //   const formData = new FormData(event.currentTarget);

  //   const name: string = formData.get("name")!.toString();

  //   await writeUserAsync({
  //     functionName: "setProfileName",
  //     args: [name],
  //   });
  //   setResetKey(prev => prev + 1);
  // }

  const [isChangingImage, setIsChangingImage] = useState<boolean>(false);

  const isNotChangingImageOpacity = "bg-opacity-0 hover:bg-opacity-80";
  const isChangingImageOpacity = "bg-opacity-90";

  // const [resetKey, setResetKey] = useState(0);

  return (
    <div className="flex items-center justify-center m-10">
      <div className="w-[256px] h-[256px]">
        {profile?.erc721Collection === zeroAddress ? (
          <div className="w-full h-full bg-base-300 text-center">
            <p className="text-2xl m-0 p-0">Enter your NFT!</p>
            <form className="flex flex-col items-center justify-center m-4" onSubmit={onSubmit}>
              <div className="m-1">
                <label
                  htmlFor="collectionAddress"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Collection Address
                </label>
                <input
                  type="text"
                  id="collectionAddress"
                  name="collectionAddress"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="0x1234"
                  required
                />
              </div>
              <div className="m-1">
                <label htmlFor="tokenId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Token Id
                </label>
                <input
                  type="number"
                  id="tokenId"
                  name="tokenId"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="1234"
                  required
                />
              </div>
              <button className="btn btn-md btn-secondary m-1">Set</button>
            </form>
          </div>
        ) : (
          <div className="w-[256px] h-[256px] relative text-center">
            <img className="w-full h-full" alt="User Image" src={image}></img>
            <div
              className={`absolute w-full h-full bg-base-200 top-0 left-0 ${
                isChangingImage ? isChangingImageOpacity : isNotChangingImageOpacity
              } flex items-center justify-center`}
            >
              {!isChangingImage ? (
                <div className="space-y-2 opacity-0 hover:opacity-100 w-full h-full flex flex-col items-center justify-center">
                  <button
                    onClick={() => {
                      setIsChangingImage(true);
                    }}
                    className="btn btn-lg btn-primary"
                  >
                    Change
                  </button>

                  <button
                    onClick={() => {
                      setIsChangingImage(true);
                    }}
                    className="btn btn-lg btn-primary"
                  >
                    Validate
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(event: FormEvent<HTMLFormElement>) => {
                    setIsChangingImage(false);
                    onSubmit(event);
                  }}
                >
                  <div>
                    <label
                      htmlFor="collectionAddress"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Collection Address
                    </label>
                    <input
                      type="text"
                      id="collectionAddress"
                      name="collectionAddress"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="0x1234"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="tokenId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Token Id
                    </label>
                    <input
                      type="number"
                      id="tokenId"
                      name="tokenId"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="1234"
                      required
                    />
                  </div>
                  <button className="btn btn-md btn-primary">Change</button>
                  <button
                    onClick={() => {
                      setIsChangingImage(false);
                    }}
                    className="btn btn-md btn-primary"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>

            <div className="has-tooltip absolute top-0 left-0 text-center bg-base-100 rounded-full w-8 h-8 flex justify-center items-center m-1">
              <div className="tooltip rounded shadow-lg p-1 bg-base-300 mt-40 ml-72">
                <p className="m-0 text-xs font-bold">Name</p>
                <p className="m-0 text-xs">{metadata?.name}</p>
                <p className="m-0 text-xs font-bold">Description</p>
                <p className="m-0 text-xs">{metadata?.description}</p> <p className="m-0 text-xs font-bold">Token ID</p>
                <p className="m-0 text-xs">{profile?.profilePicTokenId.toString()}</p>
                <p className="m-0 text-xs font-bold">Contract</p>
                <p className="m-0 text-xs">{profile?.erc721Collection}</p>
              </div>
              <img src={greenRhombus.src} className="w-4 h-4" />
              {/* <h2 className="text-xl font-bold text-center m-0">?</h2> */}
              <div className="absolute hover:bg-base-200 w-8 h-8 rounded-full opacity-80"></div>
            </div>

            {/* <div>
                  <form
                    key={resetKey}
                    onSubmit={(event: FormEvent<HTMLFormElement>) => {
                      onSubmit2(event);
                    }}
                  >
                    <div className="text-center">
                      <div>
                        <label htmlFor="name" className="block mb-2 text-xl font-medium text-gray-900 dark:text-white">
                          {profile?.name ? profile?.name : "Name"}
                        </label>
                        <span className="flex items-center justify-center">
                          <input
                            type="text"
                            id="collectionAddress"
                            name="name"
                            className="text-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Jacob Homanics"
                            required
                          />
                          <button className="btn btn-md btn-primary">✔️</button>
                        </span>
                      </div>
                    </div>
                  </form>
                </div> */}

            {/* <div className="flex flex-col items-center justify-center">
                  <img src={xIcon.src} className="w-12" />
                  <img src={linkedinIcon.src} className="w-12" />
                  <img src={warpcastIcon.src} className="w-12" />

                  <img src={instagramIcon.src} className="w-12" />
                  <img src={nounspaceIcon.src} className="w-12" />
                </div> */}
          </div>
        )}
      </div>

      {/* <div className="flex">
        <div className="flex items-center flex-col w-[512px] bg-secondary">
          
        </div>
        <div className="flex flex-auto bg-primary shadow-2xl">Test</div>
      </div> */}
    </div>
  );
};

export default Home;
