import React from "react";
import { Network } from "./Types";

const NetworkBanner = ({ network }: { network: Network }) => {
    return (
        <>
            {(network === "prater") && (
                <section className="hero is-warning">
                    <div className="hero-body is-small">
                        <p className="has-text-centered">Using the {network} test network</p>
                    </div>
                </section>
            )}
            {network && network !== "prater" && network !== "mainnet" && (
                <section className="hero is-danger">
                    <div className="hero-body is-small">
                        <p className="has-text-centered">Wrong configuration</p>
                    </div>
                </section>
            )}
        </>
    );
};

export default NetworkBanner


