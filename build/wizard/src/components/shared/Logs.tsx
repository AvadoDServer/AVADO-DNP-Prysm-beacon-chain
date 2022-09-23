import React from "react";

import { DappManagerHelper } from "./DappManagerHelper";
import striptags from "striptags";
import AnsiUp from "ansi_up";
import styled from "styled-components";

const terminalID = "terminal";
const refreshInterval = 2 * 1000;

const ansi_up = new AnsiUp();

const TerminalBox = styled.div`
white-space: pre;
font-size: 75%;
font-family: "Inconsolata", monospace;
overflow: auto;
height: 30rem;
padding: 1.25rem;
border-radius: 0.25rem;
background-color: #343a40;
color: black;
`;

const Comp = ({ dappManagerHelper }: { dappManagerHelper: DappManagerHelper }) => {
  const [logs, setLogs] = React.useState("");

  React.useEffect(() => {
    let scrollToBottom = () => {
      const el = document.getElementById(terminalID);
      if (el) el.scrollTop = el.scrollHeight;
      scrollToBottom = () => { };
    };

    async function logDnp() {
      try {
        const logs = await dappManagerHelper.getLogs();
        if (typeof logs !== "string") throw Error("Logs must be a string");
        setLogs(logs);
        // Auto scroll to bottom (deffered after the paint)
        setTimeout(scrollToBottom, 10);
      } catch (e: any) {
        setLogs(`Error fetching logs: ${e.message}`);
      }
    }

    setLogs("fetching...");
    const interval = setInterval(logDnp, refreshInterval);
    return () => {
      clearInterval(interval);
    };
  }, [dappManagerHelper]);

  return <div className="container is-transparent">
    <TerminalBox
      dangerouslySetInnerHTML={{
        __html: ansi_up.ansi_to_html(striptags(logs || "No input"))
      }}
    />
  </div>
}

export default Comp;

