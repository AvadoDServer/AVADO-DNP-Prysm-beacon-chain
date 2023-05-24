import * as restify from "restify";
import corsMiddleware from "restify-cors-middleware2"
import axios, { Method, AxiosRequestHeaders } from "axios";
import * as fs from 'fs';
import { SupervisorCtl } from "./SupervisorCtl";
import { server_config } from "./server_config";
import defaultsettings from "./settings/defaultsettings.json";
import { execSync } from "child_process";

console.log("Monitor starting...");

const server = restify.createServer({
    name: "MONITOR",
    version: "1.0.0"
});

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: [
        /^http:\/\/localhost(:[\d]+)?$/,
        "http://*.my.ava.do"
    ]
});

server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.bodyParser());

const settings_file_path = '/data/settings.json';

server.get("/ping", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    res.send(200, "pong");
    next()
});

server.get("/network", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    res.send(200, server_config.network);
    next()
});

server.get("/name", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    res.send(200, server_config.name);
    next()
});

server.get("/settings", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    try {
        const settings = JSON.parse(fs.readFileSync(settings_file_path, 'utf8'))
        res.send(200, settings ? JSON.stringify(settings) : defaultsettings);
        next()
    } catch (err) {
        res.send(200, defaultsettings);
        next();
    }
});

server.post("/settings", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const settings = JSON.stringify(req.body, null, 4);
    fs.writeFileSync(settings_file_path, settings, 'utf8');
    restart().then((result) => {
        res.send(200, `Saved settings and restarted`);
        return next();
    })
});

server.get("/defaultsettings", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    try {
        res.send(200, defaultsettings);
        next()
    } catch (err) {
        res.send(500, "failed")
        next();
    }
});

const supervisorCtl = new SupervisorCtl(`localhost`, 5555, '/RPC2')

const restart = async () => {
    await Promise.all([
        supervisorCtl.callMethod('supervisor.stopProcess', [server_config.name, true]),
    ])
    return Promise.all([
        supervisorCtl.callMethod('supervisor.startProcess', [server_config.name, true]),
    ])
}

server.post("/service/restart", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    restart().then((result) => {
        res.send(200, "restarted");
        return next()
    }).catch((error) => {
        res.send(500, "failed")
        return next();
    })
});

server.post("/service/stop", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const method = 'supervisor.stopProcess'
    Promise.all([
        supervisorCtl.callMethod(method, [server_config.name]),
    ]).then(result => {
        res.send(200, "stopped");
        next()
    }).catch(err => {
        res.send(200, "failed")
        next();
    })
});

server.post("/service/start", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const method = 'supervisor.startProcess'
    Promise.all([
        supervisorCtl.callMethod(method, [server_config.name]),
    ]).then(result => {
        res.send(200, "started");
        next()
    }).catch(err => {
        res.send(200, "failed")
        next();
    })
});

server.get("/service/status", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const method = 'supervisor.getAllProcessInfo'
    supervisorCtl.callMethod(method, [])
        .then((value: any) => {
            res.send(200, value);
            next()
        }).catch((_error: any) => {
            res.send(500, "failed")
            next();
        });
});

////////////////////////
// EXIT validator    ///
////////////////////////

server.post("/exit_validator/:pubkey", async (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const pubkey = req.params.pubkey
    const url = `${server_config.keymanager_url}/exit_validator/${pubkey}`
    const headers = {
        'Content-Type': 'application/json'
    }
    axiosRequest(
        url,
        headers,
        req,
        res,
        next
    )
})

////////////////////////
// Checkpoint API    ///
////////////////////////

// checkpoints APIs
server.get("/:name/checkpointz/v1/beacon/slots/:slot", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const slot = req.params.slot;
    const name = req.params.name;
    const url = `https://${name}/checkpointz/v1/beacon/slots/${slot}`
    get(url, res, next)
});

// beacon chain is different
server.get("/beaconcha.in/api/v1/block/:slot", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const slot = req.params.slot;
    const url = `https://beaconcha.in/api/v1/block/${slot}`
    get(url, res, next)
});
server.get("/prater.beaconcha.in/api/v1/block/:slot", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const slot = req.params.slot;
    const url = `https://prater.beaconcha.in/api/v1/block/${slot}`
    get(url, res, next)
});
server.get("/beacon.gnosischain.com/api/v1/block/:slot", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const slot = req.params.slot;
    const url = `https://beacon.gnosischain.com/api/v1/block/${slot}`
    get(url, res, next)
});

const get = (url: string, res: restify.Response, next: restify.Next) => {
    axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
    }).then(
        (response: any) => {
            // console.dir(response.data.data)
            res.send(response.status, response.data.data)
            next();
        }
    ).catch(
        (error: any) => {
            console.log("Error contacting ", url, error);
            res.send(500, "failed")
            next();
        }
    )
}

/////////////////////////////
// Beacon chain rest API   //
/////////////////////////////

server.get('/rest/*', (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const path = req.params["*"]
    const url = `${server_config.rest_url}/${path}`
    const headers = {
        'Content-Type': 'application/json'
    }
    axiosRequest(
        url,
        headers,
        req,
        res,
        next
    )
});

/////////////////////////////
// Key manager API         //
/////////////////////////////

server.get('/keymanager/*', (req: restify.Request, res: restify.Response, next: restify.Next) => {
    processKeyMangerRequest(req, res, next);
});


server.post('/keymanager/*', (req: restify.Request, res: restify.Response, next: restify.Next) => {
    processKeyMangerRequest(req, res, next);
});

server.del('/keymanager/*', (req: restify.Request, res: restify.Response, next: restify.Next) => {
    processKeyMangerRequest(req, res, next);
});

const processKeyMangerRequest = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const path = req.params["*"]
    const url = `${server_config.keymanager_url}/keymanager/${path}`
    const headers = {
        'Content-Type': 'application/json'
    }

    // console.log(req.body, url, keymanagertoken);
    axiosRequest(
        url,
        headers,
        req,
        res,
        next
    )
}

const axiosRequest = (url: string, headers: object, req: restify.Request, res: restify.Response, next: restify.Next) => {
    axios.request({
        method: req.method as Method,
        url: url,
        data: req.body,
        headers: headers,
    }).then((response: any) => {
        res.send(response.status, response.data)
        next();
    }).catch((error: any) => {
        console.log("Error", url, error.cause);
        res.send(500, error.cause)
        next();
    });
}

server.listen(9999, function () {
    console.log("%s listening at %s", server.name, server.url);
});
