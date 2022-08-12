const { Connection, clusterApiUrl } = require("@solana/web3.js");

//list of validators on Solana Blockchain
const main = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'processed')
    //current - available validators
    //deliquent - busy validators
    const {current, deliquent} = await connection.getVoteAccounts();
    console.log('All validators:' + current.concat(deliquent).length);
    console.log('Current validators: ' + current.length);
    console.log(current[0]);
};

const runMain = async () => {
    try {
        await main()
    } catch (error) {
        console.log(error);
    }
};

runMain();