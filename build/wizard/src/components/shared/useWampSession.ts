import React from "react";

const autobahn = require('autobahn-browser')

function useWampSession(): any {
    const url = "ws://wamp.my.ava.do:8080/ws";
    const realm = "dappnode_admin";

    const [wampSession, setWampSession] = React.useState<any>();

    React.useEffect(() => {
        const connection = new autobahn.Connection({ url, realm });
        connection.onopen = (session: any) => {
            console.log("CONNECTED to \nurl: " + url + " \nrealm: " + realm);
            setWampSession(session);
        };
        // connection closed, lost or unable to connect
        connection.onclose = (reason: any, details: any) => {
            console.error("CONNECTION_CLOSE", { reason, details });
            setWampSession(null);
        };
        connection.open();
    }, []);

    return wampSession
}

export { useWampSession }