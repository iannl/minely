#!/usr/bin/env node

global.log4js = require('log4js')

const dgram = require('dgram')
var ipm = require("ip")
var wstun = require("@mdslab/wstun")

var client = new wstun.client()

const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })

socket.bind(4445, () => {
    socket.addMembership('224.0.2.60')
})

socket.on('message', (msg, rinfo) => {
    if(ipm.address()==rinfo.address){
        var port = msg.toString().match(/\[AD\](.*)\[\/AD]/)[1]
        var motd = msg.toString().match(/\[MOTD\](.*)\[\/MOTD]/)[1]
        var name = motd.split(' - ').slice(1).join(' - ')
        var extp = Math.floor(Math.random()*(1199-1111)+1111) //1111-1199
        socket.close()
        clearTimeout(searchTimeout)
        client.start(extp,'ws://localhost:188','localhost:'+port)
        console.log('Hosting "'+name+'" on i.mypi.co:'+extp)
        console.log('Ctrl+C to close the connection.')
        
    }
})

socket.on('error', (err) => {
    console.error(`Socket error: ${err.message}`)
})

process.on('SIGINT', () => {
    if(socket.readyState=='open')socket.close()
    process.exit()
})

var searchTimeout = setTimeout(()=>{
    console.log('Couldn\'t find your LAN world. Are you sure it\'s running?')
    socket.close()
},5000)