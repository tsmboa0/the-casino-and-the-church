// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";
// import { Keypair, PublicKey } from "@solana/web3.js";
// import { Transaction } from "@honeycomb-protocol/edge-client";
// import { sendTransaction } from "@honeycomb-protocol/edge-client/client/helpers";
// import { client } from "./honeycomb.config";
// import { GAME_TRAITS, PROFILE_DATA } from "./constants";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const signer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path.join(__dirname, "honeycomb.json"), "utf8"))));

// console.log(signer.publicKey.toBase58());

// const projectAddress = "HPZMbMvEqLhTB5xAVdGQQkAw8DNtEBx2Su2QEor4VYXp";
// const treeAddress = "ANfWrHrqovBYrgpNoxUp3sXKRUJ4co4mfKo5xERarQDd";


// export class HoneycombService {
//     private readonly client: any;

//     constructor() {
//         this.client = client;
//     }

//     async createHoneycombProject(projectName: string) {
//         const { createCreateProjectTransaction: { project: projectAddress, tx: txResponse } } = await this.client.createCreateProjectTransaction({
//             name: projectName,
//             authority: signer.publicKey.toBase58(),
//             payer: signer.publicKey.toBase58(),
//             profileDataConfig: {
//                 achievements: GAME_TRAITS,
//                 customDataFields: PROFILE_DATA
//             }
//         });

//         console.log(`Project Address: ${projectAddress}`);

//         const response = await this.sendTransaction(txResponse, [signer]);

//         return response;
//     }

//     async createProfileTree() {
//       try {
//         console.log("Creating profile tree for project:", projectAddress);
        
//         const result = await this.client.createCreateProfilesTreeTransaction({
//           payer: signer.publicKey.toBase58(),
//           project: projectAddress,
//           treeConfig: {
//             basic: { 
//               numAssets: 100000,
//             },
//           }
//         });

//         console.log("Raw transaction result:", JSON.stringify(result, null, 2));
        
//         if (!result || !result.createCreateProfilesTreeTransaction) {
//           throw new Error("Invalid response from createCreateProfilesTreeTransaction");
//         }
        
//         const txResponse = result.createCreateProfilesTreeTransaction;
//         console.log("Profile tree transaction created successfully");
//         const response = await this.sendTransaction(txResponse, [signer]);
//         return response;
//       } catch (error) {
//         console.error("Error creating profile tree:", error);
//         throw error;
//       }
//     }

//     async addXpToProfile(profileAddress: string, xp: number) {
//       console.log("Adding XP to profile:", profileAddress, xp);
//       try{
//         const { createUpdatePlatformDataTransaction: txResponse } = await client.createUpdatePlatformDataTransaction({
//           profile: profileAddress.toString(),
//           authority: signer.publicKey.toString(),
//           platformData: {
//             addXp: xp.toString(),
//             // addAchievements: [1],
//             // custom: {
//             //   add: [
//             //     ["location", "San Francisco, CA"]
//             //   ],
//             //   remove: ["name"],
//             // }
//           },
//         });
  
//         console.log("Transaction response:", JSON.stringify(txResponse, null, 2));
  
//         const response = await this.sendTransaction(txResponse, [signer]);
  
//         return response;
//       } catch (error) {
//         console.error("Error adding XP to profile:", error);
//         throw error;
//       }
//     }

//     async sendTransaction(txResponse: any,
//         signers: Keypair[]) {
//             try {
//                 console.log("Transaction response structure:", JSON.stringify(txResponse, null, 2));
                
//                 // Check if we have the expected structure - the transaction is nested under 'tx'
//                 if (!txResponse || !txResponse.tx || !txResponse.tx.transaction) {
//                     throw new Error("Invalid transaction response structure - missing tx.transaction");
//                 }
                
//                 const transactionData = txResponse.tx;
                
//                 // Get the latest blockhash if not provided
//                 let blockhash = transactionData.blockhash;
//                 let lastValidBlockHeight = transactionData.lastValidBlockHeight;
                
//                 if (!blockhash) {
//                     console.log("No blockhash provided, getting latest blockhash...");
//                     const latestBlockhash = await this.client.getLatestBlockhash();
//                     blockhash = latestBlockhash.blockhash;
//                     lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
//                 }
                
//                 console.log("Using blockhash:", blockhash);
//                 console.log("Using last valid block height:", lastValidBlockHeight);
                
//                 const response = await sendTransaction(
//                     this.client,
//                     {
//                       transaction: transactionData.transaction,
//                       blockhash: blockhash,
//                       lastValidBlockHeight: lastValidBlockHeight,
//                     },
//                     signers,
//                     {
//                       skipPreflight: true,
//                       commitment: "finalized",
//                     }
//                 );

//                 console.log(`Transaction Response: ${response}`);
//                 return response;
//             } catch (error) {
//                 console.error("Error sending transaction:", error);
//                 throw error;
//             }
//     }
// }