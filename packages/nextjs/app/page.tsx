"use client";

import { FormEvent, useEffect, useState } from "react";
import type { NextPage } from "next";
import { parseAbi, zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

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

    const collectionAddress: string = formData.get("collectionAddress")!.toString();
    const tokenId = BigInt(Number(formData.get("tokenId")!));

    await writeUserAsync({
      functionName: "setProfilePicTokenId",
      args: [collectionAddress, tokenId],
    });
  }

  async function onSubmit2(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name: string = formData.get("name")!.toString();

    await writeUserAsync({
      functionName: "setProfileName",
      args: [name],
    });
    setResetKey(prev => prev + 1);
  }

  const [isChangingImage, setIsChangingImage] = useState<boolean>(false);

  const isNotChangingImageOpacity = "bg-opacity-0 hover:bg-opacity-80";
  const isChangingImageOpacity = "bg-opacity-90";

  const [resetKey, setResetKey] = useState(0);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          {profile?.erc721Collection === zeroAddress ? (
            <div className="w-[256px] h-[256px] bg-base-300 text-center">
              <p>Choose your profile picture!</p>
              <form className="flex flex-col items-center justify-center" onSubmit={onSubmit}>
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
                <button className="btn btn-md btn-secondary">Set</button>
              </form>
            </div>
          ) : (
            <div>
              <div className="relative text-center">
                <img className="w-[256px] h-[256px]" alt="User Image" src={image}></img>
                <div
                  className={`absolute w-[256px] h-[256px] bg-base-200 top-0 left-0 ${
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
                        <label
                          htmlFor="tokenId"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
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

                <div className="has-tooltip absolute top-0 left-0 text-center bg-base-100 rounded-full w-8 h-8 flex justify-center items-center">
                  <div className="tooltip rounded shadow-lg p-1 bg-base-300 mt-40 ml-40">
                    <p className="m-0 text-xs font-bold">Name</p>
                    <p className="m-0 text-xs">{metadata?.name}</p>
                    <p className="m-0 text-xs font-bold">Description</p>
                    <p className="m-0 text-xs">{metadata?.description}</p>{" "}
                    <p className="m-0 text-xs font-bold">Token ID</p>
                    <p className="m-0 text-xs">{profile?.profilePicTokenId.toString()}</p>
                    <p className="m-0 text-xs font-bold">Contract</p>
                    <p className="m-0 text-xs">{profile?.erc721Collection}</p>
                  </div>
                  <h2 className="text-xl font-bold text-center m-0">?</h2>
                </div>
              </div>

              <div>
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
              </div>
            </div>
          )}
          <p></p>
        </div>
      </div>
    </>
  );
};

export default Home;
