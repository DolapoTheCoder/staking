const { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, StakeProgram, Authorized, Lockup, sendAndConfirmTransaction, PublicKey } = require("@solana/web3.js");

//list of validators on Solana Blockchain
const main = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'processed')
    const wallet = Keypair.generate();
    const airdropsignature = await connection.requestAirdrop(wallet.publicKey, 1 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropsignature);
    const stakeAccount = Keypair.generate();
    const minimumRent = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
    const amountUserWantsToStake = 0.5 * LAMPORTS_PER_SOL;
    const amountToStake = minimumRent * amountUserWantsToStake;
    const createStakeAccountTx = StakeProgram.createAccount({
        authorized: new Authorized(wallet.publicKey, wallet.publicKey),
        fromPubkey: wallet.publicKey,
        lamports: amountToStake,
        lockup: new Lockup(0, 0, wallet.publicKey),
        stakePubkey: stakeAccount.publicKey
    });
    const createStakeAccountTxId = await sendAndConfirmTransaction(
        connection, 
        createStakeAccountTx, 
        [wallet, stakeAccount]
    );
    console.log(`Stake account created Tx Id: ${createStakeAccountTxId}.`);
    let stakeBalance = await connection.getBalance(stakeAccount.publicKey);
    console.log(
        `Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL.`
    );
    
    let stakeStatus = await connection.getStakeActivation(
        stakeAccount.publicKey
    );

    console.log(
        `Stake account status: ${stakeStatus.state}.`
    );

    const validators = await connection.getVoteAccounts();

    const selectedValidators = validators.current[0];
    const selectedValidatorsPubkey = new PublicKey(selectedValidators.votePubkey);
    const delegateTx = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: wallet.publicKey,
        votePubkey: selectedValidatorsPubkey,
    });

    const delegateTxId = await sendAndConfirmTransaction(
        connection, 
        delegateTx, 
        [wallet, stakeAccount]
    );

    console.log(`Stake account delegate to ${selectedValidatorsPubkey}. Tx Id: ${delegateTxId}`);
    
    stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
    console.log(`Stake account status: ${stakeStatus.state}.`)
};

const runMain = async () => {
    try {
        await main()
    } catch (error) {
        console.log(error);
    }
};

runMain();