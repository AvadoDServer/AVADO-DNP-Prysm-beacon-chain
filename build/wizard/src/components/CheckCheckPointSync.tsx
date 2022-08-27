import Validators from "./shared/Validators";
import { SettingsType } from "./shared/Types";
import { RestApi } from "./shared/RestApi";
import { DappManagerHelper } from "./shared/DappManagerHelper";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faBook } from "@fortawesome/free-solid-svg-icons";
import { json } from "stream/consumers";

interface Props {
    restApi: RestApi | undefined | null
}

const CheckCheckPointSync = ({ restApi }: Props) => {

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

    const [finalizedState, setFinalizedState] = React.useState<responseType>();

    React.useEffect(() => {
        const getFinalizedState = async () => {
            if (!restApi)
                return;
            restApi.get("/eth/v1/beacon/headers/finalized", res => {
                if (res.status === 200) {
                    setFinalizedState(res.data)
                }
            }, (e) => {
                setFinalizedState(undefined)
            });
        }

        getFinalizedState();
        const interval = setInterval(() => {
            getFinalizedState();
        }, 5 * 1000); // 5 seconds refresh
        return () => clearInterval(interval);
    }, [restApi]);


    return (
        <>
            {restApi && (
                <div>
                    <div className="container has-text-centered ">
                        <div className="columns is-vcentered">
                            <div className="column">
                                <h2 className="title is-2 has-text-white">Check state root</h2>
                                <div className="content">
                                    <p>
                                        If you used checkpoint sync to sync the beacon chain,
                                        it is recommend to check this checkpoint was not compromised,
                                        by checking the finalized checkpoint against another trusted source.
                                    </p>
                                    <p>
                                        The <code>state root</code> of the finalized checkpoint (slot: <b>{finalizedState?.data.header.message.slot}</b>)
                                        of your node is: <code>{finalizedState?.data.header.message.state_root}</code>
                                    </p>
                                    <p>
                                        <b>TODO:</b> Check one or more of the trused sources below, and make sure the state root matches:
                                        <ul>
                                            <li><a href={"https://beaconcha.in/block/" + finalizedState?.data.header.message.state_root}>Beaconcha.in</a></li>
                                        </ul>
                                    </p>
                                    <p>
                                        If it is a match, all good. If it is <b>not</b> a match you should start from scratch by reseting your
                                        beacon node and starting from the top.
                                    </p>
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
