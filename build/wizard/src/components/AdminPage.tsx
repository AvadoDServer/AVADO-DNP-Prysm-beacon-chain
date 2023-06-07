import { RestApi } from "./shared/RestApi";
import { DappManagerHelper } from "./shared/DappManagerHelper";
import Logs from "./shared/Logs";
import { useEffect, useState } from "react";
import server_config from "../server_config.json";

interface Props {
    api: RestApi | undefined | null
    dappManagerHelper: DappManagerHelper
}

const Comp = ({ api, dappManagerHelper }: Props) => {


    const stop = async () => {
        api?.post("/service/stop", {}, (res) => {
            console.log("Stop")
        }, (err) => { })
    }
    const start = async () => { api?.post("/service/start", {}, (res) => { }, (err) => { }) }
    const restart = async () => { api?.post("/service/restart", {}, (res) => { }, (err) => { }) }

    const [status, setStatus] = useState<any[]>();

    useEffect(() => {
        const interval = setInterval(() => {
            api?.get("/service/status", (res) => {
                setStatus(res.data);
            }, (err) => {
                setStatus([]);
            });
        }, 5 * 1000); // 5 seconds refresh
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <h2 className="title is-2">Debug</h2>
            <div className="content">
                <ul>
                    {server_config.name === "teku" && (
                        <li>
                            <a href={"http://teku-prater.my.ava.do:5051/swagger-ui"} target="_blank" rel="noopener noreferrer">Swagger RPC UI</a>

                        </li>
                    )}
                    {dappManagerHelper && (
                        <li>
                            <a href={`http://my.ava.do/#/Packages/${dappManagerHelper.packageName}/detail`} target="_blank" rel="noopener noreferrer">Avado package management page</a>

                        </li>
                    )}
                </ul>
                {status && (
                    <ul>
                        {status.map((program) =>
                            <li>
                                <b>{program.name}</b>: {program.statename}
                            </li>
                        )}
                    </ul>
                )}
                {
                    <div className="field">
                        <button className="button" onClick={() => stop()}>Stop</button>
                        <button className="button" onClick={() => start()}>Start</button>
                        <button className="button" onClick={() => restart()}>Restart</button>
                    </div>
                }

                {dappManagerHelper && (<Logs dappManagerHelper={dappManagerHelper} />)}
            </div>

        </>
    )
}

export default Comp;
