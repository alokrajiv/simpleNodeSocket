var app = require('express')();
var server = require('http').Server(app);
var port = process.env.PORT || 1337;
var io = require('socket.io')(server);
app.use(require('body-parser')());
server.listen(port);


//--start-->BufferPipe datatype
function BufferPipe() {
    this._maxSize = 10;
    this._storage = [];
}

BufferPipe.prototype.in = function(data) {
    var size = ++this._size;
    this._storage.push(data);
    if (this._storage.length > this._maxSize)
        this._storage.shift();
};
BufferPipe.prototype.show = function() {
    return this._storage;
};
//--end-->BufferPipe datatype


var missions = [
    {
        id: 0,
        name: 'MISSION Microsoft Azure',
        descr: 'Survey?',
        logo: 'images/ben.png',
        messagePipe: new BufferPipe()
    },
    {
        id: 1,
        name: 'MISSION Elon Musk',
        descr: 'AMA (Q/A)',
        logo: 'images/max.png',
        messagePipe: new BufferPipe()
    },
    {
        id: 2,
        name: 'MISSION Startup Weekend',
        descr: '2 Questions',
        logo: 'images/adam.jpg',
        messagePipe: new BufferPipe()
    },
    {
        id: 3,
        name: 'MISSION UAE',
        descr: 'Expo 2020 New Ideas!',
        logo: 'images/mike.png',
        messagePipe: new BufferPipe()
    }
];



app.get('/', function(req, res) {
    res.json({ messg: 'HELLO WORLD' });
});
app.get('/missions', function(req, res) {
    res.json({ data: missions });
});
app.post('/missions', function(req, res) {
    missions = req.body.data;
    res.json(missions);
});

io.on('connection', function(socket) {
    socket.on('requestDataMissions', function(data, callback) {
        var missionsToSend = [];
        missions.forEach(function(mission) {
            missionsToSend.push({
                id: mission.id,
                name: mission.name,
                descr: mission.descr,
                logo: mission.logo,
            })
        })
        callback({}, { data: missionsToSend });
    });
    socket.on('requestDataMissionChat', function(data, callback) {
        for (var i = 0; i < missions.length; i++) {
            console.warn(missions[i]);
            if (missions[i].id == data.missionId) {
                var data = missions[i].messagePipe.show();
                callback({}, { data: data });
                break;
            }
        }
    });
    socket.on('requestStoreMission', function(data, callback) {
        var tmp = data.mission;
        tmp.messagePipe = new BufferPipe();
        console.warn(tmp);
        missions.push(tmp);
        callback({}, { status: 'ok' });
        io.emit('refreshChannel', { label: 'missionsList' });
    });
    socket.on('requestRemoveMission', function(data, callback) {
        var id = data.mission.id;
        for (var i = 0; i < missions.length; i++) {
            if (missions[i].id == id) {
                var res = { status: 'fail' };
                if (i > -1) {
                    missions.splice(i, 1);
                    res.status = 'ok';
                }
                callback({}, { status: 'ok' });
                io.emit('refreshChannel', { label: 'missionsList' });
                break;
            }
        }
    });
    socket.on('channel1', function(data) {
        socket.broadcast.emit('channel1', data);
        for (var i = 0; i < missions.length; i++) {
            if (missions[i].id == data.missionId) {
                missions[i].messagePipe.in(data);
                break;
            }
        }
    });
});



/*
,
    {
        id: 4,
        name: 'MISSION Mastermind',
        descr: 'Standford University',
        logo: 'images/mike.png'
    },
    {
        id: 5,
        name: 'MISSION YCombinator',
        descr: 'Live AMA with Sam Altiman',
        logo: 'images/ben.png'
    },
    {
        id: 6,
        name: 'MISSION TechCrunch UAE',
        descr: 'VR/AR Event Paid-Testing',
        logo: 'images/max.png'
    },
    {
        id: 7,
        name: 'MISSION Bayt CTO',
        descr: 'New Position',
        logo: 'images/adam.jpg'
    },
    {
        id: 8,
        name: 'MISSION Dubai Comicon',
        descr: 'How could we improve!',
        logo: 'images/perry.png'
    },
    {
        id: 9,
        name: 'MISSION HBO',
        descr: 'New TV Show? What do you think of the script?',
        logo: 'images/mike.png'
    }
    */