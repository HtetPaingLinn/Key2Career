@echo off
echo Starting local Hardhat network...
start "Hardhat Node" cmd /k "npx hardhat node"
timeout /t 5
echo Deploying contract...
npx hardhat run scripts/deploy.js --network localhost
echo Local network is ready!
pause
