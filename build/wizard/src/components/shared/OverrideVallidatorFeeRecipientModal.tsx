import React from "react";
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Network } from "./Types";
import { RestApi } from "./RestApi"

interface Props {
    network: Network
    keyManagerAPI: RestApi | undefined
    validators_proposer_default_fee_recipient: string | undefined
    updateValidators: () => void
    configuringfeeRecipient: ConfiguringfeeRecipient | undefined | null
    setConfiguringfeeRecipient: (configuringfeeRecipient: ConfiguringfeeRecipient | null) => void
}

interface ConfiguringfeeRecipient {
    pubKey: string
    feerecipient: string
}

const OverrideVallidatorFeeRecipientModal = ({ network, keyManagerAPI, validators_proposer_default_fee_recipient, updateValidators, configuringfeeRecipient, setConfiguringfeeRecipient }: Props) => {
    const [feeRecipientFieldValue, setFeeRecipientFieldValue] = React.useState<string>("");
    const [feeRecipientFieldValueError, setFeeRecipientFieldValueError] = React.useState<string | null>(null);

    const beaconchainUrl = (validatorPubkey: string, text: any) => {
        const beaconChainBaseUrl = ({
            "prater": "https://prater.beaconcha.in",
            "mainnet": "https://beaconcha.in"
        })[network]
        return <a href={beaconChainBaseUrl + validatorPubkey}>{text ? text : validatorPubkey}</a>;
    }

    React.useEffect(() => {
        window.addEventListener('keyup', (e) => { if (e.key === "Escape") setConfiguringfeeRecipient(null) });
    }, [setConfiguringfeeRecipient])

    React.useEffect(() => {
        setFeeRecipientFieldValue(configuringfeeRecipient?.feerecipient ?? "")
    }, [configuringfeeRecipient])

    const saveFeeRecipient = async (pubKey: string, feeRecipientAddress: string) => {
        if (!keyManagerAPI)
            return;
        if (feeRecipientAddress) {
            keyManagerAPI.post(`/eth/v1/validator/${pubKey}/feerecipient`, {
                "ethaddress": feeRecipientAddress
            }, (res) => {
                console.log(res)
                if (res.status !== 202) {
                    setFeeRecipientFieldValueError(res.data.message)
                    console.log(res.data)
                } else {
                    console.log("Configured fee recipient via key manager: ", res)
                    setFeeRecipientFieldValueError(null)
                    setConfiguringfeeRecipient(null)
                    updateValidators()
                }
            }, (e) => {
                console.log("error", e.response.data.message)
                setFeeRecipientFieldValueError(e.response.data.message)
            });

        } else {
            keyManagerAPI.delete(`/eth/v1/validator/${pubKey}/feerecipient`, {},
                (res) => {
                    if (res.status !== 204) {
                        setFeeRecipientFieldValueError(res.data.message)
                        console.log(res.data)
                    } else {
                        console.log("Configured fee recipient via key manager: ", res)
                        setFeeRecipientFieldValueError(null)
                        setConfiguringfeeRecipient(null)
                        updateValidators()
                    }
                }, (e: any) => {
                    console.log("error", e.response.data.message)
                    setFeeRecipientFieldValueError(e.response.data.message)
                })
        }
    }

    return (
        <>
            <div className={"modal is-clipped" + (configuringfeeRecipient ? " is-active" : "")}>
                <div className="modal-background"></div>

                <div className="modal-content">
                    <div className="box">
                        {configuringfeeRecipient && (<p>Configure the <b>fee recipient address</b> for {beaconchainUrl("/validator/" + configuringfeeRecipient.pubKey, <abbr title={configuringfeeRecipient.pubKey}>{configuringfeeRecipient.pubKey.substring(0, 10) + "…"}</abbr>)}</p>)}
                        <br />
                        <p>Enter a valid address to set a fee recipient for this specific validator, or enter an empty address to use the default fee recipient setting ({validators_proposer_default_fee_recipient}):</p>

                        <div className="field">
                            {/* <label className="label has-text-black">Fee recipient address</label> */}
                            <div className="control">
                                <input className={"input has-text-black" + (feeRecipientFieldValueError ? " is-danger" : "")} type="text" value={feeRecipientFieldValue === validators_proposer_default_fee_recipient ? "" : feeRecipientFieldValue} onChange={e => setFeeRecipientFieldValue(e.target.value)} />
                            </div>
                            {feeRecipientFieldValueError && (
                                <p className="help is-danger">{feeRecipientFieldValueError}</p>
                            )}
                        </div>

                        <button className="button" onClick={() => setConfiguringfeeRecipient(null)}>Cancel</button>
                        {configuringfeeRecipient && (<button className="button" onClick={() => saveFeeRecipient(configuringfeeRecipient.pubKey, feeRecipientFieldValue)}>Save</button>)}

                    </div>
                </div>

                <button className="modal-close is-large" aria-label="close" onClick={() => setConfiguringfeeRecipient(null)}></button>
            </div>

        </>
    );
};

export default OverrideVallidatorFeeRecipientModal
