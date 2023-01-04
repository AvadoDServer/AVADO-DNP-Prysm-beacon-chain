import Validators from "./shared/Validators";
import { SettingsType } from "./shared/Types";
import { RestApi } from "./shared/RestApi";
import { DappManagerHelper } from "./shared/DappManagerHelper";
import {keyManagerAPIUrl} from "./urls"

interface Props {
    restApi: RestApi | undefined | null
    keyManagerAPI: RestApi | undefined
    settings: SettingsType | undefined
    installedPackages: string[] | undefined
    dappManagerHelper: DappManagerHelper | null
}

const Comp = ({ restApi, keyManagerAPI, settings, dappManagerHelper, installedPackages }: Props) => {

    const isValidatorInstalled = () => {
        const validatorClient = settings?.network === "prater" ? "eth2validator-prater.avado.dnp.dappnode.eth" : "eth2validator.avado.dnp.dappnode.eth"
        if (!installedPackages || !validatorClient) {
            return true; // not initialized yet
        }
        return installedPackages.includes(validatorClient)
    }

    return (
        <>
            {!isValidatorInstalled() ? (
                <div>
                    <div className="container has-text-centered ">
                        <div className="columns is-vcentered">
                            <div className="column">
                                <div className="content">
                                    <p className="has-text-centered has-text-black">
                                        You did not install the Prysm validator client yet.
                                        If you want to run a validator, you need to install it from the <a href="http://my.ava.do/#/installer">DappStore</a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) :
                <>

                    {restApi && keyManagerAPI && settings && dappManagerHelper ? (
                        <Validators
                            settings={settings}
                            restAPI={restApi}
                            keyManagerAPI={keyManagerAPI}
                            dappManagerHelper={dappManagerHelper}
                            readonly={true}
                        />)
                        : <p>Loading...</p>}
                    {keyManagerAPI && (
                        <div>
                            <div className="container has-text-centered ">
                                <div className="columns is-vcentered">
                                    <div className="column">
                                        <div className="content">
                                            <p className="has-text-centered">
                                                <a className="button is-medium is-link" target="_blank"
                                                    href={`${keyManagerAPIUrl}/initialize?token=${keyManagerAPI?.apiKey}`}>Open Validator UI</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>)
                    }
                </>
            }

        </>
    )
}

export default Comp;
