/* Edit this to change the home screen. App ids come from `remote.py apps`. */
window.SACRED_CONFIG = {
  name: 'Jake',
  ambientAfterSeconds: 300,          // idle time before the geometry takes over the screen
  apps: [
    { name: 'YouTube',     id: '111299001912' },
    { name: 'Netflix',     id: '11101200001' },
    { name: 'Prime Video', id: '3201512006785' },
    { name: 'Disney+',     id: '3201901017640' },
    { name: 'Apple TV',    id: '3202106024097' },
    { name: 'HBO Max',     id: '3201601007230' },
    { name: 'Spotify',     id: '3201606009684' }
  ],
  // Remote keys sent over the TV's own websocket (ws://127.0.0.1:8001).
  inputs: [
    { name: 'HDMI 1',   key: 'KEY_HDMI1' },
    { name: 'HDMI 2',   key: 'KEY_HDMI2' },
    { name: 'HDMI 3',   key: 'KEY_HDMI3' },
    { name: 'Sources',  key: 'KEY_SOURCE' },
    { name: 'Settings', key: 'KEY_MENU' },
    { name: 'Ambient',  action: 'ambient' },
    { name: 'TizenBrew', action: 'tizenbrew' }   // back to TizenBrew's module list (also: Red)
  ]
};
