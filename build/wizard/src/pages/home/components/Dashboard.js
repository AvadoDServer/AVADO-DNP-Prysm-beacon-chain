import React from "react";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import classNames from "classnames";
// import axios from "axios";
// import spinner from "../../../assets/spinner.svg";
// import privateKeyToAddress from 'ethereum-private-key-to-address';
// import getInstalledEthNode from "../../../util/getInstalledEthNode";

// const dcloudmonitorAPI = "";
// const dcloudmonitorAPI ="http://my.prysm-beacon-chain-mainnet.avado.dnp.dappnode.eth";

import BeaconChainInfo from "./BeaconChainInfo";

const Comp = () => {

    // const [currentEnv, setCurrentEnv] = React.useState({});

    // const getEnv = () => {
    //     setShowSpinner(true);
    //     return new Promise((resolve, reject) => {
    //         console.log("Polling config from container");
    //         axios.get(`${dcloudmonitorAPI}/getenv`).then((res) => {
    //             if (res && res.data) {
    //                 setCurrentEnv(res.data);
    //                 // setShowSpinner(false);
    //                 // if (!res.data.PRIVATE_KEY) {
    //                 //     setCurrentView("edit");
    //                 // }
    //                 resolve(res.data);
    //             }
    //         }).catch(() => {
    //             // reject();
    //             resolve();
    //         });
    //     });
    // };


    // React.useEffect(() => {
    //     getEnv();
    // }, []);


    // const setEnv = (vals) => {
    //     setShowSpinner(true);
    //     return axios.post(`${dcloudmonitorAPI}/setenv`, vals).then((res) => {
    //         if (res && res.data) {
    //             setCurrentEnv(res.data);

    //             getServiceStatus("relayer").then((status) => {
    //                 if (status.statename === "RUNNING") {
    //                     console.log("Stopping service");
    //                     stopService("relayer").then(() => {
    //                         console.log("Starting service");
    //                         startService("relayer");
    //                     })
    //                 }
    //             })
    //             setShowSpinner(false);
    //         }
    //     });
    // };


    const header = () => {
        return (
            <section className="is-medium has-text-white">
                <div className="columns is-mobile">
                    <div className="column is-8-desktop is-10">
                        <h1 className="title is-1 is-spaced has-text-white">ETH2.0 Beacon chain monitor</h1>
                    </div>
                </div>
                {/* <p className="">Beacon chain</p> */}
            </section>
        )
    }

    return (
        <>
            {header()}
            {/* <h3 className="is-size-3 has-text-white">Settings</h3> */}

            <BeaconChainInfo/>
            
            <section className="is-medium has-text-white">
                {/* <div className="set_setting">
                    <h3 className="is-size-5">Note</h3>
                    <p>Please note that this package is not the final executable for mainnet yet (it has not been released yet by the Prysm team).</p>
                    <p>By installing this - you are sure to auto-update to the final executable when the ETH2 beacon chain goes live.</p>
                </div> */}
                {/* <div className="set_setting">
                    <h3 className="is-size-5">Reward & signing address</h3>
                    <p><b><a href={`https://etherscan.io/address/${currentEnv.PUB_KEY}`}>{currentEnv.PUB_KEY}</a></b></p>
                </div>
                <div className="set_setting">
                    <h3 className="is-size-5">Relayer Fee</h3>
                    <p><b>{currentEnv.RELAYER_FEE} %</b></p>
                </div>
                <a onClick={() => { setCurrentView("edit"); }} className="button is-medium is-success changebtn">Change settings</a> */}
            </section>


        </>
    )



};

export default Comp;