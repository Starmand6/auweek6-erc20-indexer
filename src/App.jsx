import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  IconButton,
  useColorMode
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa'
import { ethers } from 'ethers';

function App() {

  // User Wallet State
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [accountAddress, setAccountAddress] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const {colorMode, toggleColorMode} = useColorMode();

  // State for showing balances
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  useEffect(() => {
    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      sethaveMetamask(true);
    };
    checkMetamaskAvailability();
  }, []);

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      let balance = await provider.getBalance(accounts[0]);
      let bal = ethers.utils.formatEther(balance);
      setAccountAddress(accounts[0]);
      setAccountBalance(bal);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  async function getTokenBalance() {
    try {
    const config = {
      apiKey: 'kPwtsHAamfjIA1LqTksxvz4usB9P3L1k',
      network: Network.ETH_MAINNET,
    };
    

    if (isConnected) {
      const address = accountAddress.toString()
      setUserAddress(ethers.utils.getAddress(address));
    }

    const alchemy = new Alchemy(config);
    const data = await alchemy.core.getTokenBalances(userAddress);

    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
  } catch (e) {
    console.log(e);
  }
  }
  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <IconButton
            icon={colorMode === 'dark' ? <FaSun /> : <FaMoon />}
            isRound="true"
            size="md"
            alignSelf="flex-end"
            onClick={toggleColorMode}
            mt={8}
          />
          <Heading mb={0} fontSize={36} mt={10}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Search for any ethereum address's ERC-20
            token balances on ETH Mainnet
          </Text>
          <Text>
            (Reminder that ETH is not an ERC-20)
          </Text>
        </Flex>
          
      </Center>
      <header className="App-header">
              {haveMetamask ? (
                <div className="App-header">
                  {isConnected ? (
                    <div className="card">
                      <div className="card-row">
                        <h3>Wallet Address:</h3>
                        <p>
                          {accountAddress.slice(0, 4)}...
                          {accountAddress.slice(38, 42)}
                        </p>
                      </div>
                      <div className="card-row">
                        <h3>Wallet ETH Balance:</h3>
                        <p>{accountBalance}</p>
                      </div>
                    </div>
                  ) : (
                    <div>Wallet Not Connected</div>
                  )}
                  {isConnected ? (
                    <p className="info">🎉 Connected Successfully</p>
                  ) : (
                    <button className="btn" onClick={connectWallet}>
                      Connect
                    </button>
                  )}
                </div>
              ) : (
                <p>Please Install MataMask</p>
              )}
          </header>
           
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        
        {/* <Button fontSize={20} onClick={getTokenBalance} mt={6} bgColor="coral">
          Show Connected Wallet Token Balances
        </Button> */}
        <Heading mt={42} fontSize={20}>
          If your MetaMask is connected, click the orange button below to see 
          your token balances.
        </Heading>
        <Heading mt={1} fontSize={20}>
          To see any Ethereum address's ERC-20 token balances, disconnect your wallet
          by  
        </Heading>
        <Heading mt={1} fontSize={20}>
          by refreshing the page and enter the address in the text box: 
        </Heading>
        <Input
          onChange={(e) => {
            const checkedAddress = ethers.utils.getAddress(e.target.value);
            return setUserAddress(checkedAddress)
          }}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
          mt={8}
        />
        <Button fontSize={20} onClick={getTokenBalance} mt={10} bgColor="coral">
          Show ERC-20 Token Balances
        </Button>



        <Heading my={10}>ERC-20 token balances:</Heading>

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={'column'}
                  color="white"
                  bg="blue"
                  w={'20vw'}
                  key={e.id}
                >
                  <Box>
                    <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i].decimals
                    ).slice(0,10)}
                  </Box>
                  <Image src={tokenDataObjects[i].logo} />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          'Please make a query! This may take a few seconds...'
        )}
      </Flex>
    </Box>
  );
}

export default App;


