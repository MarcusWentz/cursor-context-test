# cursor-context-test

## Overview

Testing Cursor context rules.

## Create Cursor Rules

Cursor rules are defined in the following path

```shell
.cursor/rules
```

with `.mdc` files.

## Reference 

https://docs.cursor.com/context/rules#project-rules

## Deploy Blended Contracts

### Step 1 - Deploy Rust Contract

Change directory to `rust` contract folder

```shell
cd rust
```

Compile Rust contract for WASM binary 

```shell
gblend build rust -r
```

Deploy Rust contract with WASM binary

```shell
gblend deploy \
--private-key $devTestnetPrivateKey \
--dev lib.wasm \
--gas-limit 3000000
```

Copy this deployed Rust contract address, 
since this will be used for the Solidity contract communication.

⚠️ Note: to update Rust crate `fluentbase-sdk` if there are issues: ⚠️

```shell
cargo clean
cargo update -p fluentbase-sdk
```

### Step 2 - Deploy Solidity Contract

Switch back to the root of this repo, then switch to the `solidity` contract folder

```shell
cd ../
cd solidity
```

Deploy the Solidity contract with the Rust contract address 
with the Forge flag which defines path to constructor input text file `--constructor-args-path`

```shell
forge create src/FluentSdkRustTypesTest.sol:FluentSdkRustTypesTest \
--constructor-args-path src/deployConstructor/FluentSdkRustTypesTest.txt \
--private-key $devTestnetPrivateKey \
--rpc-url https://rpc.dev.gblend.xyz/ \
--broadcast \
--verify \
--verifier blockscout \
--verifier-url https://blockscout.dev.gblend.xyz/api/
```

Foundry test fork deployed contracts on Fluent testnet 

```shell
forge coverage --fork-url https://rpc.dev.gblend.xyz/
```

## Test Frontend Website Locally

Run locally for testing with:

```shell
npm install http-server
```

then

```shell
npx http-server
```

or

```shell
http-server
```