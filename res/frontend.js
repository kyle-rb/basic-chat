var app;
var socket;
document.addEventListener('DOMContentLoaded', init);

Vue.component('message', {
  props: ['message'],
  template: '<div class="message-container"><em>{{ message.from }}</em><p>{{ message.text }}</p></div>',
  mounted: function() {
    this.$el.scrollIntoView({ behavior: 'smooth' });
  },
});

function init() {  
  app = new Vue({
    el: '#app',
    data: {
      username: '',
      inputMessage: '',
      messages: [
        // { id: '0', from: 'User One', text: 'what up' },
        // { id: '1', from: 'User Two', text: 'yo' },
        // { id: '2', from: 'User Two', text: 'fuckers' },
        // { id: '3', from: 'User Three', text: 'hi' },
        // { id: '4', from: 'User Two', text: 'yo' },
        // { id: '5', from: 'User Two', text: 'yo' },
        // { id: '6', from: 'User Two', text: 'yo' },
        // { id: '7', from: 'User Two', text: 'yo' },
        // { id: '8', from: 'User Two', text: 'yo' },
      ],
      latestId: 8,
    },
    methods: {
      sendMessage: function() {
        if (this.inputMessage === '') return;
        this.latestId++;
        socket.send(JSON.stringify({
          // id: this.latestId, // let server set unique id
          from: this.username || 'Anon',
          text: this.inputMessage,
        }));
        this.inputMessage = '';
      }
    },
  });

  socket = new WebSocket('ws://192.168.0.103:8080');
  socket.addEventListener('open', function(event) {
    console.log('connected to server!');
  });
  socket.addEventListener('message', function(event) {
    console.log(event.data);
    app.messages.push(JSON.parse(event.data));
  });
}
