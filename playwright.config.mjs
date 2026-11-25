import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/browser',timeout:30000,workers:1,
 use:{baseURL:'http://127.0.0.1:4181',headless:true,launchOptions:process.env.CS_CHROMIUM_PATH?
 {executablePath:process.env.CS_CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}:{}},
 webServer:{command:'node access/prepare.mjs --fixture && python3 -m http.server 4181 --bind 127.0.0.1 --directory .staging',url:'http://127.0.0.1:4181',reuseExistingServer:false},reporter:'list'});
