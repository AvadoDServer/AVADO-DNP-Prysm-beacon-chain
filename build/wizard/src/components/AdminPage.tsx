import { RestApi } from "./shared/RestApi";
import { DappManagerHelper } from "./shared/DappManagerHelper";
import { SupervisorCtl } from "./shared/SupervisorCtl";
import Logs from "./shared/Logs";

interface Props {
    name : string
    restApi: RestApi | undefined | null
    dappManagerHelper: DappManagerHelper
    supervisorCtl: SupervisorCtl | undefined
}

const Comp = ({ name, restApi, dappManagerHelper, supervisorCtl }: Props) => {


    const togglePrysm = (enable: boolean) => {
        const method = enable ? 'supervisor.startProcess' : 'supervisor.stopProcess'
        supervisorCtl?.callMethod(method, ["prysmbeaconchain"]);
    }
    return (
        <>
            <h2 className="title is-2 has-text-white">Debug</h2>
            <div className="content">
                <ul>
                   {dappManagerHelper && (
                        <li>
                            <a href={`http://my.ava.do/#/Packages/${dappManagerHelper.packageName}/detail`} target="_blank" rel="noopener noreferrer">Avado package management page</a>

                        </li>
                    )}
                </ul>
                {supervisorCtl && <div className="field">
                    <button className="button" onClick={() => togglePrysm(true)}>Start {name}</button>
                    <button className="button" onClick={() => togglePrysm(false)}>Stop {name}</button>
                </div>
                }

                {dappManagerHelper && (<Logs dappManagerHelper={dappManagerHelper} />)}
            </div>

        </>
    )
}

export default Comp;
