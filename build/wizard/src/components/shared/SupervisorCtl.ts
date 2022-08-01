import xmlrpc from "xmlrpc";

// methods: http://supervisord.org/api.html
type Method = 'supervisor.addProcessGroup' | 'supervisor.clearAllProcessLogs' | 'supervisor.clearLog' | 'supervisor.clearProcessLog' |
    'supervisor.clearProcessLogs' | 'supervisor.getAPIVersion' | 'supervisor.getAllConfigInfo' | 'supervisor.getAllProcessInfo' |
    'supervisor.getIdentification' | 'supervisor.getPID' | 'supervisor.getProcessInfo' | 'supervisor.getState' | 'supervisor.getSupervisorVersion' |
    'supervisor.getVersion' | 'supervisor.readLog' | 'supervisor.readMainLog' | 'supervisor.readProcessLog' | 'supervisor.readProcessStderrLog' |
    'supervisor.readProcessStdoutLog' | 'supervisor.reloadConfig' | 'supervisor.removeProcessGroup' | 'supervisor.restart' | 'supervisor.sendProcessStdin' |
    'supervisor.sendRemoteCommEvent' | 'supervisor.shutdown' | 'supervisor.signalAllProcesses' | 'supervisor.signalProcess' | 'supervisor.signalProcessGroup' |
    'supervisor.startAllProcesses' | 'supervisor.startProcess' | 'supervisor.startProcessGroup' | 'supervisor.stopAllProcesses' | 'supervisor.stopProcess' |
    'supervisor.stopProcessGroup' | 'supervisor.tailProcessLog' | 'supervisor.tailProcessStderrLog' | 'supervisor.tailProcessStdoutLog' |
    'system.listMethods' | 'system.methodHelp' | 'system.methodSignature' | 'system.multicall'


export class SupervisorCtl {

    host: string;
    path: string;
    port: number;

    client: xmlrpc.Client;

    constructor(host: string, port: number, path: string) {
        this.host = host;
        this.port = port;
        this.path = path;

        this.client = xmlrpc.createClient({ host: host, port: port, path: path })
    }

    callMethod(method: Method, params: any[]) {
        this.client.methodCall(method, params, (error: any, value) => {
            if (error) {
                console.log('supervisorCtl error:', error, `(${this.host},${this.port},${this.path})`);
                console.log('req headers:', error.req && error.req._header);
                console.log('res code:', error.res && error.res.statusCode);
                console.log('res body:', error.body);
            } else {
                return value;
            }
        })

    }
}