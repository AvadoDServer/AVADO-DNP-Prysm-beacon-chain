import server_config_json from "./server_config.json"

const packageUrl = server_config_json.network === `prysm-beacon-chain-${server_config_json.network}.my.ava.do`

export const server_config = {
    ...server_config_json,
    rest_url: "http://localhost:3500",
    keymanager_url: server_config_json.network === "mainnet" ? `http://eth2validator.my.ava.do:9999` : `http://eth2validator-${server_config_json.network}.my.ava.do:9999`

}