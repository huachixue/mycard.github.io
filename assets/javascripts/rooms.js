// Generated by CoffeeScript 1.4.0
(function() {
  var Room, Rooms, Server,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Server = (function(_super) {

    __extends(Server, _super);

    function Server() {
      return Server.__super__.constructor.apply(this, arguments);
    }

    Server.configure("Server", "name", "ip", "port", "index");

    Server.extend(Spine.Model.Ajax);

    Server.url = "/servers.json";

    return Server;

  })(Spine.Model);

  Room = (function(_super) {

    __extends(Room, _super);

    function Room() {
      return Room.__super__.constructor.apply(this, arguments);
    }

    Room.configure("Room", "name", "status", "private");

    Room.belongsTo('server', Server);

    return Room;

  })(Spine.Model);

  Rooms = (function(_super) {

    __extends(Rooms, _super);

    Rooms.prototype.events = {
      'click .room': 'clicked'
    };

    function Rooms() {
      this.render = __bind(this.render, this);
      Rooms.__super__.constructor.apply(this, arguments);
      Room.bind("refresh", this.render);
    }

    Rooms.prototype.render = function() {
      return this.html($('#room_template').tmpl(_.sortBy(Room.all(), this.sort)));
    };

    Rooms.prototype.sort = function(room) {
      return [room.status === "wait" ? 0 : 1, room["private"]];
    };

    Rooms.prototype.clicked = function(e) {
      var room;
      room = $(e.target).tmplItem().data;
      if (room["private"]) {
        $('#join_private_room')[0].reset();
        $('#join_private_room').data('room_id', room.id);
        return $('#join_private_room_dialog').dialog('open');
      } else {
        return mycard.join(room.server().ip, room.server().port, room.name);
      }
    };

    return Rooms;

  })(Spine.Controller);

  $(document).ready(function() {
    var new_room, rooms;
    if (true) {
      Candy.init('/http-bind/', {
        core: {
          debug: false,
          autojoin: ['mycard@conference.my-card.in']
        },
        view: {
          resources: '/vendor/stylesheets/candy/',
          language: 'cn'
        }
      });
      if (window.location.href.indexOf("candy") !== -1) {
        Candy.Core.connect('zh99998测试80@my-card.in', 'zh112998');
      }
      $('#candy').show();
    }
    $('#new_room_dialog').dialog({
      autoOpen: false,
      resizable: false,
      title: "建立房间"
    });
    $('#join_private_room_dialog').dialog({
      autoOpen: false,
      resizable: false,
      title: "加入私密房间"
    });
    new_room = $('#new_room')[0];
    new_room.tag.onchange = function() {
      if (this.checked) {
        new_room.pvp.checked = false;
        return new_room.match.checked = false;
      }
    };
    new_room.match.onchange = function() {
      if (this.checked) {
        return new_room.tag.checked = false;
      }
    };
    new_room.pvp.onchange = function() {
      if (this.checked) {
        new_room.tag.checked = false;
        new_room.tcg.checked = false;
        new_room.ocg.checked = true;
        return new_room.lp.value = 8000;
      }
    };
    new_room.ocg.onchange = function() {
      if (!this.checked) {
        return new_room.tcg.checked = true;
      }
    };
    new_room.tcg.onchange = function() {
      if (this.checked) {
        return new_room.pvp.checked = false;
      } else {
        return new_room.ocg.checked = true;
      }
    };
    new_room.onsubmit = function(ev) {
      var mode, result, rule, server, servers;
      ev.preventDefault();
      $('#new_room_dialog').dialog('close');
      rule = this.tcg.checked ? (this.ocg.checked ? 2 : 1) : 0;
      mode = this.tag.checked ? 2 : this.match.checked ? 1 : 0;
      if (rule !== 0 || this.lp.value !== '8000') {
        result = "" + rule + mode + "FFF" + this.lp.value + ",5,1,";
      } else if (this.tag.checked) {
        result = "T#";
      } else if (this.pvp.checked && this.match.checked) {
        result = "PM#";
      } else if (this.pvp.checked) {
        result = "P#";
      } else if (this.match.checked) {
        result = "M#";
      }
      result += this.name.value;
      if (this.password.value) {
        result += '$' + this.password.value;
      }
      servers = Server.all();
      server = servers[Math.floor(Math.random() * servers.length)];
      return mycard.join(server.ip, server.port, result);
    };
    $('#join_private_room').submit(function(ev) {
      var room, room_id, server;
      ev.preventDefault();
      $('#join_private_room_dialog').dialog('close');
      if (this.password.value) {
        room_id = $(this).data('room_id');
        if (Room.exists(room_id)) {
          room = Room.find(room_id);
          server = room.server();
          return mycard.join(server.ip, server.port, "" + room.name + "$" + this.password.value);
        } else {
          return alert('房间已经关闭');
        }
      }
    });
    $('#new_room_button').click(function() {
      new_room.reset();
      new_room.name.value = Math.floor(Math.random() * 1000);
      return $('#new_room_dialog').dialog('open');
    });
    rooms = new Rooms({
      el: $('#rooms')
    });
    Server.one("refresh", function() {
      var websocket, wsServer;
      wsServer = 'ws://mycard-server.my-card.in:9998';
      websocket = new WebSocket(wsServer);
      websocket.onopen = function() {
        return console.log("Connected to WebSocket server.");
      };
      websocket.onclose = function() {
        return console.log("Disconnected");
      };
      websocket.onmessage = function(evt) {
        var room, _i, _len;
        console.log('Retrieved data from server: ' + evt.data);
        rooms = JSON.parse(evt.data);
        for (_i = 0, _len = rooms.length; _i < _len; _i++) {
          room = rooms[_i];
          if (room._deleted) {
            if (Room.exists(room.id)) {
              Room.find(room.id).destroy();
            }
          }
        }
        return Room.refresh((function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = rooms.length; _j < _len1; _j++) {
            room = rooms[_j];
            if (!room._deleted) {
              _results.push(room);
            }
          }
          return _results;
        })());
      };
      return websocket.onerror = function(evt) {
        return console.log('Error occured: ' + evt.data);
      };
    });
    return Server.fetch();
  });

}).call(this);
