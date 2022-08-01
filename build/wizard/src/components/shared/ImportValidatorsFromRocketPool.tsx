import React from "react";
import { RestApi } from "./RestApi"
import { DappManagerHelper } from "./DappManagerHelper";
import { Network } from "./Types";
import { abbreviatePublicKey, createBeaconchainUrl } from "./Validators";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSatelliteDish, faRocket } from "@fortawesome/free-solid-svg-icons";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

interface IProps {
    keyManagerAPI: RestApi | undefined
    dappManagerHelper: DappManagerHelper | null
    network: Network | undefined
    updateValidators: () => void
}


const rocketPoolPackageName = "rocketpool.avado.dnp.dappnode.eth"
const ImportValidatorsFromRocketPool = ({ keyManagerAPI, dappManagerHelper, network, updateValidators }: IProps) => {
    const [isRocketPoolInstalled, setIsRocketPoolInstalled] = React.useState(false);
    const [rocketPoolKeys, setRocketPoolKeys] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (dappManagerHelper)
            dappManagerHelper.getPackages().then((packages) => {
                console.dir(packages)
                if (packages)
                    setIsRocketPoolInstalled(packages.includes(rocketPoolPackageName))

            })
    }, [dappManagerHelper])

    function getRocketPoolKeysBasePath(network: Network | undefined) {
        const dataFolder = (network === "kiln") ? "data-kiln" : (network === "prater") ? "data-prater" : "data"
        return `/rocketpool/${dataFolder}/validators/teku`
    }

    React.useEffect(() => {
        if (dappManagerHelper && isRocketPoolInstalled) {
            const basePath = getRocketPoolKeysBasePath(network)
            const command = `docker exec DAppNodePackage-rocketpool.avado.dnp.dappnode.eth ls ${basePath}/keys`

            dappManagerHelper.runSigned(command).then(result => {
                console.log(result)
                //TODO parse etc
                //TODO filter existing keys
                setRocketPoolKeys(["0xa963b315d9ef21a214f636255b46a90ec3b74b84d23748180ec99cee5176d0a1c858dd6c44c9f90b3f7420ea77c0cc23.txt",
                    "0x900a122c72e383ef5ec1c0ddacb5753c5076eb738ba7d63f1bf84d7a4c28c8095bacd6ff7c92c6d354000ae14580ac27.txt",
                    "0x87d149664634a2dd5c9c8489560265bd01cbede268ff144ce752835f6e76f36f4e1b3da7f1b83c174e8e9d9c857ee4ef.txt"])
            })
        }
    }, [dappManagerHelper, isRocketPoolInstalled, network])

    async function importRocketPoolKey(key: string, dappManagerHelper: DappManagerHelper, keyManagerAPI: RestApi, updateValidators: () => void) {
        // get key file
        const keyFileContent = await dappManagerHelper.getFileContentFromContainer(getRocketPoolKeysBasePath(network) + "/keys/0x" + key + ".json", rocketPoolPackageName)
        console.log("KEY", keyFileContent)
        // get Password
        const passwordFileContent = await dappManagerHelper.getFileContentFromContainer(getRocketPoolKeysBasePath(network) + "/passwords/0x" + key + ".txt", rocketPoolPackageName)
        // import key
        if (true) {
            keyManagerAPI.post("/eth/v1/keystores", {
                keystores: [keyFileContent],
                passwords: [passwordFileContent]
            }, (res) => {
                updateValidators();
            }, (e) => {
                console.log(e)
            });
        }
    }


    const confirmImport = (key: string) => {
        //TODO ask confirmation (slashing!)
        importRocketPoolKey(key, dappManagerHelper!, keyManagerAPI!, updateValidators)
    }

    return (
        <>
            {isRocketPoolInstalled && rocketPoolKeys && dappManagerHelper && keyManagerAPI && network && (
                <>
                    {rocketPoolKeys.map((key) =>
                        <div className="field has-addons">
                            <label className="field-label">Import from Rocket Pool</label>
                            {abbreviatePublicKey(key)}
                            {createBeaconchainUrl(network, "/validator/" + key, <FontAwesomeIcon className="icon" icon={faSatelliteDish} />)}
                            {/* <a href={"https://rocketscan.io/address/" + key}><FontAwesomeIcon icon={faRocket} /></a> */}

                            <div className="control">
                                <button className="button is-link" key={key} onClick={() => confirmImport(key)}>Import</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default ImportValidatorsFromRocketPool