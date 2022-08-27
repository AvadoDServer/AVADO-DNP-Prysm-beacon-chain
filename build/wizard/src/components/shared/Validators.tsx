import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSatelliteDish, faTrash } from "@fortawesome/free-solid-svg-icons";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import AddValidator from "./AddValidator";
import { Network, SettingsType } from "./Types";
import OverrideVallidatorFeeRecipientModal from "./OverrideVallidatorFeeRecipientModal";
import { RestApi } from "./RestApi";
import { useNavigate } from "react-router-dom";
import thereIsNothingHereYet from "../../assets/there-is-nothing-here-yet.jpeg";
import ImportValidatorsFromRocketPool from "./ImportValidatorsFromRocketPool";
import { DappManagerHelper } from "./DappManagerHelper";

interface Props {
    settings: SettingsType | undefined
    restAPI: RestApi
    keyManagerAPI: RestApi
    dappManagerHelper: DappManagerHelper | null
    readonly?: boolean
}

interface ValidatorData {
    "index": string
    "balance": string,
    "status": string,
    "validator": {
        "pubkey": string,
        "withdrawal_credentials": string,
        "effective_balance": string,
        "slashed": boolean,
        "activation_eligibility_epoch": string,
        "activation_epoch": string,
        "exit_epoch": string,
        "withdrawable_epoch": string
    }
}

interface ConfiguringfeeRecipient {
    pubKey: string
    feerecipient: string
}

export const abbreviatePublicKey = (key: string) => <abbr title={key}>{key.substring(0, 10) + "…"}</abbr>

export const createBeaconchainUrl = (network: Network | null | undefined, validatorPubkey: string, text?: any) => {
    const beaconChainBaseUrl = ({
        "prater": "https://prater.beaconcha.in",
        "mainnet": "https://beaconcha.in",
        "kiln": "https://beaconchain.kiln.themerge.dev/"
    })[network ?? "mainnet"]
    return <a href={beaconChainBaseUrl + validatorPubkey}>{text ? text : validatorPubkey}</a>;
}

const Validators = ({ settings, restAPI, keyManagerAPI, dappManagerHelper, readonly = false }: Props) => {
    const [validatorData, setValidatorData] = React.useState<ValidatorData[]>();
    const [validators, setValidators] = React.useState<string[]>();
    const [feeRecipients, setFeeRecipients] = React.useState<string[]>();

    const [configuringfeeRecipient, setConfiguringfeeRecipient] = React.useState<ConfiguringfeeRecipient | null>();

    const navigate = useNavigate();

    const beaconchainUrl = (validatorPubkey: string, text: any) => {
        return createBeaconchainUrl(settings?.network, validatorPubkey, text)
    }

    const updateValidators = React.useCallback(async () => {
        console.log("Trying to update validators")
        keyManagerAPI.get("/eth/v1/keystores",
            (res) => {
                if (res.status === 200) {
                    setValidators(res.data.data.map((d: any) => d.validating_pubkey))
                } else {
                    console.log("error updating validators", res)
                }
            }, (e) => {
                console.log("error updating validators", e)
            });
    }, [keyManagerAPI])

    React.useEffect(() => {
        updateValidators();
    }, [keyManagerAPI, settings, updateValidators])

    React.useEffect(() => {
        const getFeeRecipient = async (pubKey: string) => {
            if (!settings?.validators_proposer_default_fee_recipient) {
                return "Configure default setting first!"
            }

            return keyManagerAPI.get<string>(`/eth/v1/validator/${pubKey}/feerecipient`,
                (res) => {
                    if (res.status === 200) {
                        // console.log(res)
                        const address = res.data.data.ethaddress;
                        if (address && address !== "0x0000000000000000000000000000000000000000")
                            return address
                        else
                            return settings?.validators_proposer_default_fee_recipient
                    } else {
                        return settings?.validators_proposer_default_fee_recipient
                    }
                }, (err) => {
                    console.log("Error in validators_proposer_default_fee_recipient", err)
                    return settings?.validators_proposer_default_fee_recipient
                });
        }

        const getValidatorData = async (pubKey: string): Promise<ValidatorData> => {
            const nullValue = {
                "index": "0",
                "balance": "0",
                "status": "pending_initialized",
                "validator": {
                    "pubkey": pubKey,
                    "withdrawal_credentials": "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "effective_balance": "00000000000",
                    "slashed": false,
                    "activation_eligibility_epoch": "0",
                    "activation_epoch": "0",
                    "exit_epoch": "0",
                    "withdrawable_epoch": "0"
                }
            };
            return await restAPI.get(`/eth/v1/beacon/states/finalized/validators/${pubKey}`, res => {
                if (res.status === 200) {
                    // console.log(res.data.data)
                    return (res.data.data as ValidatorData);
                } else
                    return nullValue
            }, (err) => {
                return nullValue
            });
        }

        if (validators) {
            Promise.all(validators.map(pubKey => getValidatorData(pubKey))).then(result => setValidatorData(result))
            Promise.all(validators.map(pubKey => getFeeRecipient(pubKey))).then(result => setFeeRecipients(result))
        }
    }, [validators, settings?.validators_proposer_default_fee_recipient, keyManagerAPI, restAPI]);

    function askConfirmationRemoveValidator(pubKey: string) {
        confirmAlert({
            message: `Are you sure you want to remove validator "${pubKey}"?`,
            buttons: [
                {
                    label: 'Remove',
                    onClick: () => removeValidator(pubKey)
                },
                {
                    label: 'Cancel',
                    onClick: () => { }
                }
            ]
        });
    }

    const downloadSlashingData = (data: string) => {
        const element = document.createElement("a");
        const file = new Blob([data], { type: 'text/json' });
        element.href = URL.createObjectURL(file);
        element.download = "slashing_protection.json";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    const removeValidator = (pubKey: string) => {
        console.log("Deleting " + pubKey);
        //https://ethereum.github.io/keymanager-APIs/#/Local%20Key%20Manager/DeleteKeys
        keyManagerAPI.delete("/eth/v1/keystores", { pubkeys: [pubKey] }, (res) => {
            console.dir(res)
            console.log(res)
            downloadSlashingData(res.data.slashing_protection)
            if (res.status === 200) {
                updateValidators();
            }
        }, (e) => {
            console.log(e)
            console.dir(e)
        });
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            // https://ethereum.github.io/beacon-APIs/#/ValidatorRequiredApi/getStateValidator
            case "pending_initialized": return "is-info" // When the first deposit is processed, but not enough funds are available (or not yet the end of the first epoch) to get validator into the activation queue.
            case "pending_queued": return "is-info" // When validator is waiting to get activated, and have enough funds etc. while in the queue, validator activation epoch keeps changing until it gets to the front and make it through (finalization is a requirement here too).
            case "active_ongoing": return "is-success" // When validator must be attesting, and have not initiated any exit.
            case "active_exiting": return "is-warning" // When validator is still active, but filed a voluntary request to exit.
            case "active_slashed": return "is-danger"// When validator is still active, but have a slashed status and is scheduled to exit.
            case "exited_unslashed": return "is-info"// When validator has reached reguler exit epoch, not being slashed, and doesn't have to attest any more, but cannot withdraw yet.
            case "exited_slashed": return "is-danger"// When validator has reached reguler exit epoch, but was slashed, have to wait for a longer withdrawal period.
            case "withdrawal_possible": return "is-info"// After validator has exited, a while later is permitted to move funds, and is truly out of the system.
            case "withdrawal_done": return "is-info"// (not possible in phase0, except slashing full balance)// actually having moved funds away
            default: return ""
        }
    }

    const configureFeeRecipient = (pubKey: string, feeRecipient: string) => {
        if (settings?.validators_proposer_default_fee_recipient) {
            setConfiguringfeeRecipient({ pubKey: pubKey, feerecipient: feeRecipient })
        } else {
            navigate("/settings#validators_proposer_default_fee_recipient")
        }
    }

    return (
        <div>
            <div className="container has-text-centered ">
                <div className="columns is-vcentered">
                    <div className="column">
                        {(!validators || !validatorData || !feeRecipients) && (
                            <p>Loading...</p>
                        )}
                        {validators && validators.length < 1 && (
                            <>
                                <div className="content">
                                    <p>You don't have configured any validators yet.</p>
                                    <p>Click the "Add validator" widget to import your validator keys.</p>
                                    <div className="columns is-centered">
                                        <div className="column is-half">
                                            <figure className="image is-4by3">
                                                <img src={thereIsNothingHereYet} alt={"awkward-seal-there-is-nothing-here-yet-meme"} />
                                            </figure>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {validators && validatorData && feeRecipients && validators.length > 0 && (
                            <>
                                <OverrideVallidatorFeeRecipientModal
                                    network={settings?.network ?? "mainnet"}
                                    updateValidators={updateValidators}
                                    keyManagerAPI={keyManagerAPI}
                                    validators_proposer_default_fee_recipient={settings?.validators_proposer_default_fee_recipient}
                                    configuringfeeRecipient={configuringfeeRecipient}
                                    setConfiguringfeeRecipient={setConfiguringfeeRecipient}
                                />
                                <div className="notification is-success">
                                    {beaconchainUrl("/dashboard?validators=" + validatorData.map(v => v.index).join(","), <>Beacon Chain Validator DashBoard <FontAwesomeIcon className="icon" icon={faSatelliteDish} /></>)}
                                </div>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Public key</th>
                                            <th>Index</th>
                                            <th>Balance</th>
                                            <th>Effective Balance</th>
                                            {/* <th>Activation Epoch</th> */}
                                            {/* <th>Exit Epoch</th> */}
                                            <th>Fee recipient</th>
                                            <th>Status</th>
                                            {!readonly && (<th>Actions</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {validatorData.map((validator, i) =>
                                            <tr key={validator.index}>
                                                <td>{beaconchainUrl("/validator/" + validator.index, <FontAwesomeIcon className="icon" icon={faSatelliteDish} />)}</td>
                                                <td>{beaconchainUrl("/validator/" + validator.index, abbreviatePublicKey(validator.validator.pubkey))}</td>
                                                <td>{beaconchainUrl("/validator/" + validator.index, validator.index)}</td>
                                                <td>{(parseFloat(validator.balance) / 1000000000.0).toFixed(4)}</td>
                                                <td>{(parseFloat(validator.validator.effective_balance) / 1000000000.0).toFixed(4)}</td>
                                                {/* <td>{validator.validator.activation_epoch}</td> */}
                                                {/* <td>{validator.validator.exit_epoch}</td> */}
                                                <td>
                                                    {/* eslint-disable-next-line */}
                                                    <a className="link" onClick={() => {if (!readonly) configureFeeRecipient(validator.validator.pubkey, feeRecipients[i])}}>
                                                        {abbreviatePublicKey(feeRecipients[i])}
                                                    </a>
                                                </td>
                                                <td><span className={"tag " + getStatusColor(validator.status)}>{validator.status}</span></td>
                                                {!readonly && (<td><button className="button is-text has-text-grey-light" onClick={() => askConfirmationRemoveValidator(validator.validator.pubkey)}><FontAwesomeIcon className="icon" icon={faTrash} /></button></td>)}
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </>
                        )}
                        {validators && !readonly && (<AddValidator updateValidators={updateValidators} keyManagerAPI={keyManagerAPI} />)}
                        {false && keyManagerAPI && (<ImportValidatorsFromRocketPool keyManagerAPI={keyManagerAPI} dappManagerHelper={dappManagerHelper} network={settings?.network} updateValidators={updateValidators} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Validators
