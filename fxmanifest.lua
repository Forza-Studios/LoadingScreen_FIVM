fx_version 'cerulean'
description "Loadingscreen script by forza"
games { 'gta5' }
lua54 "yes"

author '_forza'
description 'Custom Loading Screen'
version '1.1.0'

loadscreen 'index.html'
loadscreen_manual_shutdown 'yes'
client_script 'client.lua'
server_script 'server.lua'
loadscreen_cursor 'yes'

files {
    'index.html',
    'css/style.css',
    'script/main.js'
}
