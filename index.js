'use strict';
var util = require('util');
var EventEmitter = require('datas').EventEmitter;
var _ = require('lodash');
var Myo = require('myo');

var DEFAULT_OPTIONS = {
  id : 0,
  broadcast : {
    accelerometer: {
      enabled : false,
      interval : 500
    },
    IMU: {
      enabled : false,
      interval : 500
    },
    gyroscope: {
      enabled : false,
      interval : 500
    },
    orientation: {
      enabled: false,
      interval: 500
    }
  }
};

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
   command : {
     type : 'object',
     properties : {
       action : {
         type : 'string',
         enum : ['vibrate', 'requestBlueToothStrength'],
         default : 'vibrate'
       },
       vibrationLength : {
         type : 'string',
         enum : ['short', 'medium', 'long'],
         default : 'short'
       }
     }
   }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    id : {
      type : 'number',
      default : 0,
      required : true
    },
    interval: {
      title : 'interval in ms',
      type: 'number',
      required : true,
      default: 500
    },
    accelerometer: {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          required: true,
          default: false
        }
      }
    },
    imu : {
      type : 'object',
      properties : {
        enabled : {
          type : 'boolean',
          required : true,
          default : false
        }
      }
    },
    gyroscope : {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          required: true,
          default: false
        }
      }
    },
    orientation : {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          required: true,
          default: false
        }
      }
    }
  }
};

function Plugin(){
  this.setOptions(DEFAULT_OPTIONS);
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  if(Myo.myos && this._myo){
    if(message.action === 'vibrate'){
      this._myo.vibrate(message.vibrationLength);
    } else if(message.action === 'requestBluetoothStrength'){
      this._myo.requestBluetoothStrength();
    }
  }
};

Plugin.prototype.onConfig = function(device){
  var self = this;
  self.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
  this.setupMyo();
};

Plugin.prototype.setupMyo = function() {
  var self = this;

  var myoId = self.options.id || 0;
  self._myo = Myo.create(myoId);
  self._myo.initSocket();
  self._myo.unlock();

  var throttledEmit = _.throttle(function(){
    self.emit.apply(self, arguments);
  }, self.options.interval);


  self._myo.on('connected', function(){
    throttledEmit('data', {
      event : 'connected'
    });

  })

  self._myo.on('disconnected', function(){
    throttledEmit('data', {
      event : 'disconnected'
    });
  })

  self._myo.on('arm_synced', function(){
    throttledEmit('data', {
      event : 'arm_synced'
    });
  })

  self._myo.on('arm_unsynced', function(){
    throttledEmit('data', {
      event : 'arm_unsynced'
    });
  })

  self._myo.on('rest', function(data){
    throttledEmit('data', data);
  });

  self._myo.on('rest', function(data){
    throttledEmit('data', data);
  });

  self._myo.on('rest', function(data){
    throttledEmit('data', data);
  });

  self._myo.on('accelerometer', function(data){
    if(self.options.accelerometer.enabled){
      throttledEmit('data', data);
    }
  });

  self._myo.on('rest', function(data){
    throttledEmit('data', data);
  });

  self._myo.on('fingers_spread', function(data){
    throttledEmit('data', data);
  });

  self._myo.on('wave_in', function(data){
    throttledEmit('data', data);
  });

  self._myo.on('wave_out', function(data){
    throttledEmit('data', data);
  });

  self._myo.on('fist', function(data){
    throttledEmit('data', data);
  });

  self._myo.on('thumb_to_pinky', function(data){
    throttledEmit('data', data);
  });

  self._myo.on('gyroscope', function(data){
    if(self.options.gyroscope.enabled){
      throttledEmit('data', data);
    }
  });
  self._myo.on('orientation', function(data){
    if(self.options.orientation.enabled){
      throttledEmit('data', data);
    }
  });
  self._myo.on('imu', function(data){
    if(self.options.imu.enabled){
      throttledEmit(self.emit('data', data));
    }
  });

  self._myo.on('bluetooth_strength', function(val){
    throttledEmit(self.emit('data', {bluetoothStrength : val}));
  });

};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  defaultOptions : DEFAULT_OPTIONS,
  Plugin: Plugin
};
