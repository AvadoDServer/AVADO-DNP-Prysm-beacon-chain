import React from "react";
import spinner from "../../../assets/spinner.svg";

import SwaggerClient from 'swagger-client'
import proto from "./spec.json";

const Comp = ({ onSynced }) => {


    const [syncing, setSyncing] = React.useState(undefined);
    const [chainHead, setChainHead] = React.useState(null);
    const [error, setError] = React.useState();
    const [ready, setReady] = React.useState();
    const [timer, setTimer] = React.useState();
    const [swaggerClient, setSwaggerClient] = React.useState();

    React.useEffect(() => {
        new SwaggerClient({ spec: proto })
            .then((client, error) => {
                setSwaggerClient(client);
                updateStats();
            })
    }, []);

    const updateStats = () => {

        if (!swaggerClient || !swaggerClient.apis) {
            console.log("No API's yet - waiting...")
        } else {

            swaggerClient.apis.Node.GetSyncStatus().then((status) => {
                if (status.body && status.body.syncing === false) {
                    onSynced && onSynced();
                }
                if (status.body) {
                    setSyncing(status.body.syncing);
                }
                setReady(true);
            }).catch((e) => {
                // debugger;
                setError("Waiting for beacon chain to become ready");
                setChainHead(null);
                setReady(true);
            });

            swaggerClient.apis.BeaconChain.GetChainHead().then((res) => {
                setChainHead(res.body);
                setReady(true);
            }).catch((e) => {
                setError("Chain has not started yet");
                setChainHead(null);
                setReady(true);
            });
        }
        setTimer(setTimeout(updateStats, syncing ? 5 * 1000 : 10 * 1000));

    }


    React.useEffect(() => {
        updateStats();
    }, [swaggerClient]);

    React.useEffect(() => {
        return (() => {
            console.log(`clear timer`);
            timer && clearInterval(timer);
        })
    }, []);

    if (!ready) {
        return (
            <>
                <section className="is-medium has-text-white">
                    <div className="columns">
                        <div className="column is-8">
                            <div className="card">
                                <header className="card-header">
                                    <p className="card-header-title has-text-centered">Beacon chain info</p>
                                </header>

                                <div className="card-content has-text-left">
                                    <p>fetching beacon chain info...</p>
                                    <p><span className="icon"><img alt="spinner" src={spinner} /></span></p>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    if (!swaggerClient) {
        return null;
    }

    return (
        <>
            <section className="is-medium has-text-white">
                <div className="columns">
                    <div className="column is-8">
                        <div className="card">
                            <header className="card-header">
                                <p className="card-header-title has-text-centered">Beacon chain info</p>
                                {(chainHead) && (<p className="card-header-icon">epoch: {chainHead.headEpoch} , slot {chainHead.headSlot}</p>)}

                            </header>
                            {error
                                ? (
                                    <div className="card-content has-text-left">
                                        <p>{error}</p>
                                        <p><span className="icon"><img alt="spinner" src={spinner} /></span></p>
                                    </div>
                                ) : (
                                    <div className="card-content has-text-left">
                                        <p>status: {syncing === false ? (<span className="tag is-success">in sync</span>) : (<span className="tag is-warning">syncing</span>)}</p>
                                        {(chainHead) && (
                                            <>
                                                <p><a target="_new" href="https://beaconcha.in/">beaconcha.in explorer</a></p>
                                                {syncing !== false && (<h3 className="title is-3">Waiting until the beacon chain has synced</h3>)}
                                            </>
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );

}


export default Comp;