// Self-check for proxy health probes — run: node src/server.check.js
// Fails if /healthz waits on the upstream, /readyz goes ready before the app index is cached,
// or SIGTERM does not let the process drain and exit.
const assert = require('assert')
const http = require('http')
const path = require('path')
const { spawn } = require('child_process')

function status(port, route) {
    return new Promise((resolve, reject) => {
        const req = http.get({ hostname: '127.0.0.1', port, path: route, timeout: 1000 }, (res) => {
            res.resume()
            res.on('end', () => resolve(res.statusCode))
        })

        req.on('error', reject)
        req.on('timeout', () => {
            req.destroy()
            reject(new Error('timeout'))
        })
    })
}

async function waitFor(port, route, expected) {
    let last = 'no response'

    for (let i = 0; i < 40; i++) {
        try {
            last = await status(port, route)
            if (last === expected) return
        } catch (err) {
            last = err.message
        }

        await new Promise((resolve) => setTimeout(resolve, 200))
    }

    throw new Error(route + ' expected ' + expected + ', last was ' + last)
}

function startProxy(serverUrl) {
    const child = spawn(process.execPath, ['src/server.js'], {
        cwd: path.join(__dirname, '..'),
        env: Object.assign({}, process.env, {
            SERVER_URL: serverUrl,
            PROXY_PORT: '0'
        }),
        stdio: ['ignore', 'pipe', 'pipe']
    })
    let logs = ''

    child.logs = () => logs
    child.port = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('proxy did not listen\n' + logs)), 10000)
        const onChunk = (chunk) => {
            logs += chunk
            const match = String(logs).match(/App-proxy server started on (\d+)/)

            if (!match) return

            clearTimeout(timer)
            resolve(Number(match[1]))
        }

        child.stdout.on('data', onChunk)
        child.stderr.on('data', onChunk)
        child.once('exit', (code) => reject(new Error('proxy exited ' + code + '\n' + logs)))
    })

    return child
}

function stop(child) {
    return new Promise((resolve) => {
        if (child.exitCode !== null) return resolve(child.exitCode)

        const timer = setTimeout(() => child.kill('SIGKILL'), 5000)

        child.once('exit', (code) => {
            clearTimeout(timer)
            resolve(code)
        })
        child.kill('SIGTERM')
    })
}

function listenUpstream() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end('<html>ok</html>')
        })

        server.listen(0, '127.0.0.1', () => resolve(server))
    })
}

;(async () => {
    const cold = startProxy('http://127.0.0.1:9')
    const coldPort = await cold.port

    try {
        await waitFor(coldPort, '/healthz', 200)
        await waitFor(coldPort, '/readyz', 503)
        const stillCold = await status(coldPort, '/readyz')

        assert.strictEqual(stillCold, 503, 'readyz must stay 503 while the app index fetch is failing')
        const coldExit = await stop(cold)

        assert.strictEqual(coldExit, 0, 'SIGTERM should drain and exit 0\n' + cold.logs())
    } catch (err) {
        await stop(cold)
        throw new Error(err.message + '\n' + cold.logs())
    }

    const upstream = await listenUpstream()
    const warm = startProxy('http://127.0.0.1:' + upstream.address().port)
    const warmPort = await warm.port

    try {
        await waitFor(warmPort, '/healthz', 200)
        await waitFor(warmPort, '/readyz', 200)
        process.kill(warm.pid, 'SIGUSR2')
        await waitFor(warmPort, '/readyz', 503)
        const alive = await status(warmPort, '/healthz')

        assert.strictEqual(alive, 200, 'liveness stays up while the pod is draining')
        const warmExit = await stop(warm)

        assert.strictEqual(warmExit, 0, 'SIGTERM should drain and exit 0\n' + warm.logs())
    } catch (err) {
        await stop(warm)
        throw new Error(err.message + '\n' + warm.logs())
    } finally {
        upstream.close()
    }

    console.log('server.check OK')
})().catch((err) => {
    console.error(err)
    process.exit(1)
})
