import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faSatelliteDish } from "@fortawesome/free-solid-svg-icons";
import { RestApi } from "./RestApi";
import { ValidatorData, abbreviatePublicKey, createBeaconchainUrl } from "./Validators";
import { Network } from "./Types";

interface Props {
    validator: ValidatorData
    api: RestApi
    updateValidators: () => void
    network: Network
}


const ExitValidatorModal = ({ validator, api, updateValidators, network }: Props) => {

    const [modalActive, setModalActive] = useState<boolean>(false);
    const [confirmation, setConfirmation] = useState('');

    const exitValidator = () => {
        const pubKey = validator.validator.pubkey
        console.log("Exiting " + pubKey);

        setModalActive(false)

        api.post(`/exit_validator/${pubKey}`, {}, (res) => {
            console.log(res.data)
            if (res.status === 200) {
                triggerValidatorUpdates()
            }
            alert(res.data);
        }, (e) => {
            console.log(e)
        });
    }

    // trigger 3 updates with different waiting intervals
    // because it takes a while before exit status is in the validator data
    const triggerValidatorUpdates = async () => {
        // now
        updateValidators();
        // in 15s
        await setTimeout(updateValidators, 15000);
        // in 12 min
        await setTimeout(updateValidators, 12 * 60000 + 2000);
    }

    const cancel = () => {
        setConfirmation("")
        setModalActive(false)
    }

    return (
        <>
            <button className="button is-text has-text-grey-light" name="exit" onClick={() => setModalActive(true)}><FontAwesomeIcon className="icon" icon={faArrowUpFromBracket} /></button>

            <div className={"modal" + (modalActive ? " is-active" : "")}>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Exit validator {validator.index} ?</p>
                        <button className="delete" aria-label="close" onClick={cancel}></button>
                    </header>
                    <section className="modal-card-body">
                        <p className="mb-4">
                            Are you sure you want to exit validator
                            {createBeaconchainUrl(network, "/validator/" + validator.validator.pubkey, <><code>{abbreviatePublicKey(validator.validator.pubkey)}</code> <FontAwesomeIcon className="icon" icon={faSatelliteDish} /></>)}
                            ?
                        </p>
                        <p className="mb-4">
                            Please make sure you understand the consequences of performing a voluntary exit.
                            Once an account is exited, the action cannot be reverted.
                        </p>

                        <div className="field mb-4">
                            <div className="control">
                                <input className="input" type="text" placeholder="Confirmation" value={confirmation} onChange={e => setConfirmation(e.target.value)} />
                            </div>
                            <p className="help">Type "<i>agree</i>" if you want to exit this validator</p>
                        </div>

                        <p className="mb-4">
                            Note that it takes a while to broadcast your exit-message. It might take a few minutes before the validator list reflects the new status of your validator.
                            Keep your validator running until the status is "exited_unslashed".
                        </p>

                    </section>
                    <footer className="modal-card-foot">
                        <button className={"button"} disabled={confirmation !== "agree"} onClick={exitValidator}>Exit validator</button>
                        <button className="button" onClick={cancel}>Cancel</button>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default ExitValidatorModal
