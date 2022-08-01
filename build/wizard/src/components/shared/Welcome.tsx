import React from "react";
import { Link } from "react-router-dom";
import { DappManagerHelper } from "./DappManagerHelper";

interface Props {
    logo: string
    title: string
    dappManagerHelper: DappManagerHelper
}

const Welcome = ({ logo, title, dappManagerHelper }: Props) => {

    // const [executionEngines, setExecutionEngines] = React.useState<string[]>([]);

    // const supportedEth1Packages = [
    //     "ethchain-geth.public.dappnode.eth",
    //     "avado-dnp-nethermind.public.dappnode.eth"
    // ]

    // React.useEffect(() => {
    //     if (dappManagerHelper) {
    //         dappManagerHelper.getPackages()
    //             .then(packages => {
    //                 // check if Execution engine is installed
    //                 const eth1Nodes = supportedEth1Packages.filter(p => packages.includes(p));
    //                 setExecutionEngines(eth1Nodes)
    //             }
    //             )

    //     }
    // }, [dappManagerHelper])


    return (
        <div>
            <div className="container has-text-centered ">
                <div className="columns is-vcentered">
                    <div className="column">
                        <figure className="image is-64x64 is-inline-block">
                            <img src={logo} alt={`${title} logo`} />
                        </figure>
                        <div className="content">

                            <h1 className="title has-text-white is-2">Welcome to {title}</h1>
                            {
                                !dappManagerHelper ? (
                                    <p>loading...</p>
                                ) : (
                                    <>
                                        <p>Welcome to {title}. It might take some time for the beacon chain to initialize.</p>
                                        <p>Once {title} has initialized succesfully, it's status will appear in the top right.</p>
                                        <br />
                                        <p>While you are waiting, now is a good time to check the <b>Settings</b>.<br/>
                                        Make sure the <code>Fee Recipient address</code> has your address!</p>

                                        <Link to="/settings" className="button">Open Settings</Link>
                                    </>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Welcome


