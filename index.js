const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

let count = 0
let users = []

io.on('connection', socket => {
    count++

    socket.on('user_connect', name => {
        users.push(name)
        io.emit('user_connect', name)
        console.log(`--> user ${name} connected`)
        io.emit('get_all_users', users, count)
    })

    // socket.emit('newclientconnect',{ description: 'Hey, welcome!'});
    socket.emit('newclientconnect',{ count })

    socket.on('disconnect', () => {
        count--
        io.emit('user_disconnect')
        console.log(`<-- user disconnected`)
    })

    socket.on('new_message', (data) => {
        socket.broadcast.emit('new_message', data)
        console.log('message: ', data.name + ': ' + data.msg)
    })

    socket.on('change_name', (data) => {
        io.emit('change_name', data)
        console.log(`User ${data.name} change name to ${data.newName}`)
    })

    socket.on('user_typing', (name) => {
        socket.broadcast.emit('user_typing', name)
    })
    socket.on('stop_typing', () => {
        socket.broadcast.emit('stop_typing')
    })
})

server.listen(3000, () => {
    console.log('listening on port 3000')
})
