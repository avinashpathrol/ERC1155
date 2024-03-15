import hre from 'hardhat'

async function main(): Promise<void> {
    await hre.run("verify:verify", {
        address: "0x00000000000000000000000000000000000000",
        constructorArguments: [['0x00000000000000000000000000000000000000'], 'https://someuri', 'HoldrDev', 'HOLDR'],
      })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

    
