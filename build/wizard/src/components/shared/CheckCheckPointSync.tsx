import { Network } from "./Types";
import { RestApi } from "./RestApi";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCircleXmark, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

interface Props {
    api: RestApi | undefined | null
    network: Network
    packageUrl: String
}

const CheckCheckPointSync = ({ api, network, packageUrl }: Props) => {

    type responseType = {
        "data": {
            "root": string,
            "canonical": boolean,
            "header": {
                "message": {
                    "slot": number,
                    "proposer_index": number,
                    "parent_root": string,
                    "state_root": string,
                    "body_root": string
                },
                "signature": string
            }
        },
        "execution_optimistic": boolean
    }

    type tableDateType = {
        url: string
        state_root: string
    }

    const [finalizedState, setFinalizedState] = React.useState<responseType>();
    const [otherStateRoots, setOtherStateRoots] = React.useState<tableDateType[]>([]);

    // Get finalized state
    React.useEffect(() => {
        if (api)
            getFinalizedState(api);
    }, [api]);

    const getFinalizedState = async (api: RestApi) => {
        if (!api)
            return;
        api.get("/rest/eth/v1/beacon/headers/finalized", res => {
            if (res.status === 200) {
                setFinalizedState(res.data)
            }
        }, (e) => {
            setFinalizedState(undefined)
        });
    }


    // Get state root from other sources
    React.useEffect(() => {
        if (finalizedState) {
            const slot = finalizedState.data.header.message.slot

            // List with checkpoint-endpoints
            // https://eth-clients.github.io/checkpoint-sync-endpoints/
            const checkpoint_sync_endpoints = network === "prater" ?
                [
                    "goerli.beaconstate.info",
                    "goerli.beaconstate.ethstaker.cc",
                ]
                : network === "gnosis" ?
                    [
                        // "checkpoint.gnosischain.com",
                    ]
                    : [
                        "beaconstate.info",
                        "sync-mainnet.beaconcha.in",
                        "mainnet-checkpoint-sync.attestant.io",
                        // "checkpointz.pietjepuk.net",
                        // "mainnet.checkpoint.sigp.io"
                    ]


            const fetchFromCheckpointzEndPoint = async (endpoint: string): Promise<tableDateType> => {
                const url = api?.baseUrl + `/${endpoint}/checkpointz/v1/beacon/slots/${slot}`
                console.log(url)
                return {
                    url: `https://${endpoint}`, state_root: await axios.get(url)
                        .then(res => network === "gnosis" ?
                    res.data.block.Altair.message.state_root
                            : res.data.block.Bellatrix.message.state_root)
                        .catch(error => "could not fetch, check manually")
                }
            }

            // beaconcha.in
            const fetchFromBeaconChain = async (): Promise<tableDateType> => {
                const base_url = ({
                    "prater": "prater.beaconcha.in",
                    "gnosis": "beacon.gnosischain.com",
                    "mainnet": "beaconcha.in"
                })[network]

                const url = api?.baseUrl + `/${base_url}/api/v1/block/${slot}`
                console.log(url)
                return {
                    url: `https://${base_url}/slot/${slot}`, state_root: await axios.get(url)
                        .then(res => res.data.stateroot)
                        .catch(error => "could not fetch, check manually")
                }
            }

            Promise.all(
                checkpoint_sync_endpoints.map(fetchFromCheckpointzEndPoint)
                    .concat(fetchFromBeaconChain())
            ).then(values => setOtherStateRoots(values))
        }
    }, [finalizedState, packageUrl, network, api]);

    const refresh = () => {
        if (api) {
            getFinalizedState(api);
        }
    }

    return (
        <>
            {api && (
                <div>
                    <div className="container has-text-centered ">
                        <div className="columns is-vcentered">
                            <div className="column">
                                <h2 className="title is-2 has-text-white">Check state root</h2>
                                <div className="content">
                                    <p>
                                        If you used checkpoint sync to sync the beacon chain,
                                        it is recommend to check that this checkpoint was not compromised,
                                        by checking the finalized checkpoint against another trusted source.
                                    </p>
                                    <p>
                                        The <code>state root</code> of the finalized checkpoint (slot: <b>{finalizedState?.data.header.message.slot}</b>)
                                        of your node is: <code>{finalizedState?.data.header.message.state_root}</code>
                                    </p>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Trusted source</th>
                                                <th>state root</th>
                                                <th>check</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {otherStateRoots.map((entry) =>
                                                <tr key={entry.url}>
                                                    <td><a href={entry.url}>{entry.url}</a></td>
                                                    <td>{entry.state_root}</td>
                                                    <td>{entry.state_root === finalizedState?.data.header.message.state_root
                                                        ? <FontAwesomeIcon className="fa-solid fa-circle-check" icon={faCircleCheck} />
                                                        : <FontAwesomeIcon className="fa-solid fa-circle-xmark" icon={faCircleXmark} />}</td>

                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    {otherStateRoots.length === 0 && (
                                        <FontAwesomeIcon className="fa-spin" icon={faSpinner} />
                                    )}

                                    <p>
                                        Check the trused sources above and make sure the state root matches. If all state roots match, all is good.<br />
                                        If the state roots do <b>not</b> match you should start from scratch by reseting your beacon node and starting from the top.
                                    </p>
                                    <button onClick={() => refresh()}>Refresh</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </>
    )
}

export default CheckCheckPointSync;
