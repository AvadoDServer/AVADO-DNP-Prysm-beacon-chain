
export const supportedNetworks = ["prater", "mainnet", "gnosis"]

export type Network = typeof supportedNetworks[number]

export type SettingsType = {
    network: Network
    ee_endpoint: string
    execution_engine: string
    validators_graffiti: string,
    p2p_peer_lower_bound: number,
    p2p_peer_upper_bound: number,
    validators_proposer_default_fee_recipient: string,
    initial_state: string,
    mev_boost: boolean
}
