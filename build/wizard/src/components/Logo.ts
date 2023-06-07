import nimbus_mainnet from "../assets/nimbus-mainnet.png";
import nimbus_prater from "../assets/nimbus-prater.png";
import lighthouse_mainnet from "../assets/lighthouse-mainnet.png";
import lighthouse_prater from "../assets/lighthouse-prater.png";
import teku_mainnet from "../assets/teku-mainnet.png";
import teku_prater from "../assets/teku-prater.png";
import teku_gnosis from "../assets/teku-gnosis.png";
import prsym from "../assets/PrysmStripe.png";


import server_config from "../server_config.json"
import { Client, Network } from "./SupportedClientsAndNetworks";

const client = server_config.name as Client
const network = server_config.network as Network

export const logo = ({
    "nimbus": ({
        "prater": nimbus_prater,
        "mainnet": nimbus_mainnet,
        "gnosis": undefined
    }),
    "lighthouse": ({
        "prater": lighthouse_prater,
        "mainnet": lighthouse_mainnet,
        "gnosis": undefined
    }),
    "teku": ({
        "prater": teku_prater,
        "mainnet": teku_mainnet,
        "gnosis": teku_gnosis
    }),
    "prysm": ({
        "prater": prsym,
        "mainnet": prsym,
        "gnosis": prsym
    })
})[client][network]